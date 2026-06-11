#!/usr/bin/env bash
# Smoke test funcional do TalentBridge em DEV_MODE.
# Não é um substituto de testes automatizados - cobre só os fluxos principais.

set -u
API="http://127.0.0.1:8000"
PASS=0
FAIL=0
RESULTS=()

# Helpers ---------------------------------------------------------------------
log()  { echo -e "\033[36m[INFO]\033[0m $*"; }
ok()   { PASS=$((PASS+1)); RESULTS+=("PASS: $*"); echo -e "\033[32m[PASS]\033[0m $*"; }
fail() { FAIL=$((FAIL+1)); RESULTS+=("FAIL: $*"); echo -e "\033[31m[FAIL]\033[0m $*"; }

call() {
  # call METHOD PATH [JSON_BODY]
  local method="$1" path="$2" body="${3:-}"
  if [[ -n "$body" ]]; then
    curl -sS -X "$method" "$API$path" -H 'Content-Type: application/json' -d "$body"
  else
    curl -sS -X "$method" "$API$path"
  fi
}

status() {
  # status METHOD PATH [JSON_BODY]
  local method="$1" path="$2" body="${3:-}"
  if [[ -n "$body" ]]; then
    curl -sS -o /dev/null -w '%{http_code}' -X "$method" "$API$path" -H 'Content-Type: application/json' -d "$body"
  else
    curl -sS -o /dev/null -w '%{http_code}' -X "$method" "$API$path"
  fi
}

json_get() { python -c "import sys, json; d=json.load(sys.stdin); print(d.get('$1', ''))"; }

# 1. HEALTH ===================================================================
log "1) Health check"
hs=$(status GET /health)
[[ "$hs" == "200" ]] && ok "/health 200" || fail "/health expected 200 got $hs"

# 2. LISTAGENS BÁSICAS ========================================================
log "2) GET /vagas/abertas"
hs=$(status GET /vagas/abertas)
[[ "$hs" == "200" ]] && ok "/vagas/abertas 200" || fail "/vagas/abertas expected 200 got $hs"

VAGAS=$(call GET /vagas/abertas)
COUNT_VAGAS=$(echo "$VAGAS" | python -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('vagas', [])))")
[[ "$COUNT_VAGAS" -ge 1 ]] && ok "/vagas/abertas retornou $COUNT_VAGAS vagas" || fail "/vagas/abertas retornou 0 vagas (seed quebrado?)"

# Pega ID de uma vaga existente para usar depois
VAGA_ID=$(echo "$VAGAS" | python -c "import sys, json; d=json.load(sys.stdin); v=d.get('vagas',[]); print(v[0]['id'] if v else 0)")
log "  vaga_id=$VAGA_ID"

# 3. LOGIN COM USUÁRIO DO SEED ===============================================
log "3) Login com Ana (recrutadora do seed) - senha123"
LOGIN_ANA=$(call POST /usuarios/login '{"email":"ana.recrutadora@techsolutions.com","senha":"senha123"}')
TOKEN_ANA=$(echo "$LOGIN_ANA" | json_get access_token)
ANA_ID=$(echo "$LOGIN_ANA" | python -c "import sys, json; d=json.load(sys.stdin); print(d.get('usuario',{}).get('id',''))")
[[ -n "$TOKEN_ANA" ]] && ok "Login Ana retornou JWT (id=$ANA_ID)" || fail "Login Ana sem token: $LOGIN_ANA"

log "3b) Login com candidato do seed - lucas.almeida"
LOGIN_LUCAS=$(call POST /usuarios/login '{"email":"lucas.almeida@exemplo.com","senha":"senha123"}')
TOKEN_LUCAS=$(echo "$LOGIN_LUCAS" | json_get access_token)
LUCAS_ID=$(echo "$LOGIN_LUCAS" | python -c "import sys, json; d=json.load(sys.stdin); print(d.get('usuario',{}).get('id',''))")
[[ -n "$TOKEN_LUCAS" ]] && ok "Login Lucas retornou JWT (id=$LUCAS_ID)" || fail "Login Lucas sem token"

LOGIN_ERRADO=$(status POST /usuarios/login '{"email":"ana.recrutadora@techsolutions.com","senha":"errada"}')
[[ "$LOGIN_ERRADO" == "401" ]] && ok "Login com senha errada -> 401" || fail "Login errado deveria ser 401, foi $LOGIN_ERRADO"

# 4. FLUXO OTP DE CADASTRO (DEV_MODE: código sempre 000000) ==================
log "4) Cadastro via OTP - novo candidato"
NOVO_EMAIL="teste.smoke.$(date +%s)@exemplo.com"
SEND=$(call POST /auth/send-code "{\"email\":\"$NOVO_EMAIL\",\"tipo\":\"cadastro\",\"dados\":{\"nome\":\"Teste Smoke\",\"senha\":\"senha123\",\"tipo_usuario\":\"CANDIDATO\"}}")
echo "  send-code resp: $SEND"
if echo "$SEND" | grep -q "mensagem\|enviado\|sucesso"; then
  ok "send-code aceito"
else
  fail "send-code falhou: $SEND"
fi

VERIFY=$(call POST /auth/verify-code "{\"email\":\"$NOVO_EMAIL\",\"codigo\":\"000000\",\"tipo\":\"cadastro\"}")
NOVO_ID=$(echo "$VERIFY" | json_get usuario_id)
NOVO_TOKEN=$(echo "$VERIFY" | json_get access_token)
echo "  verify-code resp (truncado): ${VERIFY:0:200}"
if [[ -n "$NOVO_ID" && "$NOVO_ID" != "0" ]]; then
  ok "verify-code cadastrou usuário id=$NOVO_ID"
else
  fail "verify-code não retornou usuario_id: $VERIFY"
fi

# 5. CONFIRMAR QUE PERFIL FOI CRIADO ==========================================
log "5) Verificar que perfis_candidatos foi criado no cadastro"
PERFIL_EXISTE=$(docker compose exec -T db mysql -uroot -p1234 -N -B talentbridge -e "SELECT COUNT(*) FROM perfis_candidatos WHERE usuario_id=$NOVO_ID" 2>/dev/null)
[[ "$PERFIL_EXISTE" == "1" ]] && ok "perfis_candidatos criado p/ id=$NOVO_ID" || fail "perfis_candidatos NÃO foi criado p/ id=$NOVO_ID (fix de antes não funcionou?)"

# 5b. Cadastro como RECRUTADOR também ----------------------------------------
log "5b) Cadastro via OTP - novo recrutador"
EMAIL_REC="recrut.smoke.$(date +%s)@exemplo.com"
call POST /auth/send-code "{\"email\":\"$EMAIL_REC\",\"tipo\":\"cadastro\",\"dados\":{\"nome\":\"Recrut Smoke\",\"senha\":\"senha123\",\"tipo_usuario\":\"RECRUTADOR\"}}" > /dev/null
VR=$(call POST /auth/verify-code "{\"email\":\"$EMAIL_REC\",\"codigo\":\"000000\",\"tipo\":\"cadastro\"}")
REC_ID=$(echo "$VR" | json_get usuario_id)
PR_EXISTE=$(docker compose exec -T db mysql -uroot -p1234 -N -B talentbridge -e "SELECT COUNT(*) FROM perfis_recrutadores WHERE usuario_id=$REC_ID" 2>/dev/null)
[[ "$PR_EXISTE" == "1" ]] && ok "perfis_recrutadores criado p/ id=$REC_ID" || fail "perfis_recrutadores NÃO foi criado p/ id=$REC_ID"

# 6. ONBOARDING DE CANDIDATO ==================================================
log "6) Submeter onboarding do candidato recém-criado"
ONB_PAYLOAD=$(cat <<EOF
{
  "usuario_id": $NOVO_ID,
  "personal": {
    "fullName": "Teste Smoke",
    "phone": "11999999999",
    "gender": "Prefiro não dizer",
    "age": "25",
    "state": "SP",
    "city": "São Paulo",
    "zipCode": "01000000",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "about": "Candidato de teste",
    "profilePicture": null
  },
  "education": [{"course":"CC","institution":"X","degree":"Bacharel","startYear":"2020","endYear":"2024","hours":""}],
  "experience": [],
  "hardSkills": ["Python","React"],
  "softSkills": ["Comunicação"]
}
EOF
)
ONB=$(call POST /candidatos/onboarding "$ONB_PAYLOAD")
echo "  onboarding resp (truncado): ${ONB:0:200}"
CIDADE=$(docker compose exec -T db mysql -uroot -p1234 -N -B talentbridge -e "SELECT cidade FROM perfis_candidatos WHERE usuario_id=$NOVO_ID" 2>/dev/null)
[[ "$CIDADE" == "São Paulo" ]] && ok "Onboarding gravou cidade" || fail "Onboarding não gravou cidade: '$CIDADE'"

# 6b. Login pós-onboarding deve retornar onboarding_completo=true
LOGIN_POS=$(call POST /usuarios/login "{\"email\":\"$NOVO_EMAIL\",\"senha\":\"senha123\"}")
ONB_OK=$(echo "$LOGIN_POS" | python -c "import sys, json; d=json.load(sys.stdin); print(d.get('usuario',{}).get('onboarding_completo'))")
[[ "$ONB_OK" == "True" || "$ONB_OK" == "true" ]] && ok "Login pós-onboarding: onboarding_completo=true" || fail "Login pós-onboarding: onboarding_completo=$ONB_OK (esperado true)"

# 7. CANDIDATAR-SE A UMA VAGA =================================================
log "7) Candidato Lucas se candidata à vaga $VAGA_ID"
CANDIDATAR=$(call POST /vagas/candidatar "{\"vaga_id\":$VAGA_ID,\"candidato_id\":$LUCAS_ID}")
echo "  candidatar resp (truncado): ${CANDIDATAR:0:200}"
# Lucas já tem candidaturas do seed - pode dar 400 "já candidatado", isso é OK
if echo "$CANDIDATAR" | grep -qiE "sucesso|criad|enviad|já"; then
  ok "POST /vagas/candidatar aceito ou idempotente"
else
  fail "POST /vagas/candidatar inesperado: $CANDIDATAR"
fi

# 8. RECRUTADOR VÊ CANDIDATOS DELE ============================================
log "8) Dashboard da Ana"
DASH=$(call GET "/recrutador/dashboard/$ANA_ID")
NUM_RECENTES=$(echo "$DASH" | python -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('candidatos_recentes', [])))")
[[ "$NUM_RECENTES" -ge 1 ]] && ok "Dashboard Ana mostra $NUM_RECENTES candidatos recentes" || fail "Dashboard Ana retornou 0 candidatos (deveria ter do seed)"

log "8b) Pipeline da Ana - candidatos da vaga $VAGA_ID"
PIPE=$(call GET "/recrutador/pipeline/$VAGA_ID/candidatos")
NUM_PIPE=$(echo "$PIPE" | python -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('candidatos', [])))")
[[ "$NUM_PIPE" -ge 1 ]] && ok "Pipeline mostra $NUM_PIPE candidatos para vaga $VAGA_ID" || fail "Pipeline retornou 0 candidatos para vaga $VAGA_ID"

# 9. CRUD DE VAGA =============================================================
log "9) Recrutador Ana cria, edita, deleta vaga"
NOVA_VAGA=$(call POST /recrutador/vagas "{\"recrutador_id\":$ANA_ID,\"titulo\":\"Smoke Test Vaga\",\"departamento\":\"Eng\",\"descricao\":\"Vaga de teste\",\"requisitos\":\"-\",\"modalidade\":\"REMOTO\",\"localizacao\":\"\",\"faixa_salarial\":\"\",\"status\":\"ABERTA\"}")
NOVA_VAGA_ID=$(echo "$NOVA_VAGA" | json_get id)
[[ -n "$NOVA_VAGA_ID" && "$NOVA_VAGA_ID" != "0" ]] && ok "POST /recrutador/vagas criou vaga id=$NOVA_VAGA_ID" || fail "Não criou vaga: $NOVA_VAGA"

if [[ -n "$NOVA_VAGA_ID" && "$NOVA_VAGA_ID" != "0" ]]; then
  EDITAR=$(status PUT "/recrutador/vagas/$NOVA_VAGA_ID" "{\"titulo\":\"Smoke Test Vaga EDIT\",\"departamento\":\"Eng\",\"descricao\":\"Vaga de teste\",\"requisitos\":\"-\",\"modalidade\":\"REMOTO\",\"localizacao\":\"\",\"faixa_salarial\":\"\",\"status\":\"ABERTA\"}")
  [[ "$EDITAR" == "200" ]] && ok "PUT /recrutador/vagas/$NOVA_VAGA_ID -> 200" || fail "PUT vaga deu $EDITAR"

  DEL=$(status DELETE "/recrutador/vagas/$NOVA_VAGA_ID")
  [[ "$DEL" == "200" || "$DEL" == "204" ]] && ok "DELETE vaga -> $DEL" || fail "DELETE vaga deu $DEL"
fi

# 10. PERFIL COMPLETO =========================================================
log "10) Perfil completo do candidato"
PERFIL=$(call GET "/candidatos/perfil-completo/$LUCAS_ID")
if echo "$PERFIL" | grep -q "Lucas"; then
  ok "perfil-completo retorna dados de Lucas"
else
  fail "perfil-completo não retornou Lucas: ${PERFIL:0:200}"
fi

# 11. PREFERÊNCIAS DE NOTIFICAÇÃO ============================================
log "11) GET / PUT preferências"
GP=$(status GET "/usuarios/$LUCAS_ID/preferencias")
[[ "$GP" == "200" ]] && ok "GET preferencias -> 200" || fail "GET preferencias -> $GP"
PP=$(status PUT "/usuarios/$LUCAS_ID/preferencias" '{"email_novidades": true}')
[[ "$PP" == "200" ]] && ok "PUT preferencias -> 200" || fail "PUT preferencias -> $PP"

# 12. SIMULADOR (depende de Gemini - em DEV deve falhar gracefully ou ser bypass) ====
log "12) Simulador - criar sessão"
SES=$(status POST /simulador/sessoes "{\"usuario_id\":$LUCAS_ID,\"cargo_alvo\":\"Front-end\"}")
if [[ "$SES" == "200" || "$SES" == "201" ]]; then
  ok "POST /simulador/sessoes -> $SES"
else
  fail "POST /simulador/sessoes -> $SES (Gemini key?)"
fi

# 13. FLUXO DE RECUPERAÇÃO DE SENHA VIA OTP ==================================
log "13) Recuperação de senha via OTP"
RS=$(status POST /auth/send-code "{\"email\":\"lucas.almeida@exemplo.com\",\"tipo\":\"recuperacao\",\"dados\":{\"nova_senha\":\"novasenha123\"}}")
[[ "$RS" == "200" || "$RS" == "201" ]] && ok "send-code recuperacao -> $RS" || fail "send-code recuperacao -> $RS"

VRS=$(status POST /auth/verify-code '{"email":"lucas.almeida@exemplo.com","codigo":"000000","tipo":"recuperacao"}')
[[ "$VRS" == "200" || "$VRS" == "201" ]] && ok "verify-code recuperacao -> $VRS" || fail "verify-code recuperacao -> $VRS"

# Reverte para senha123 para outros testes não quebrarem
docker compose exec -T db mysql -uroot -p1234 talentbridge -e "UPDATE usuarios SET senha_hash='\$2b\$12\$ePJVK2yiNI4Bn09BNXNqRu75ipDXTQT6NLpsJtKKQwQTumKEpdyB.' WHERE email='lucas.almeida@exemplo.com';" 2>/dev/null

# 14. CHAMADAS DO RECRUTADOR ==================================================
log "14) Minhas vagas do recrutador"
MV=$(call GET "/recrutador/minhas-vagas/$ANA_ID")
NMV=$(echo "$MV" | python -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('vagas', [])))")
[[ "$NMV" -ge 1 ]] && ok "Ana tem $NMV vagas" || fail "Ana sem vagas (seed quebrado?)"

log "14b) Ranking de talentos do recrutador"
RANK=$(status GET "/recrutador/ranking/$ANA_ID")
[[ "$RANK" == "200" ]] && ok "/recrutador/ranking -> 200" || fail "/recrutador/ranking -> $RANK"

# 15. APROVAR CANDIDATO (mover status) =======================================
log "15) Atualizar status de candidatura"
# Pega uma candidatura existente
CAND_ID=$(docker compose exec -T db mysql -uroot -p1234 -N -B talentbridge -e "SELECT c.id FROM candidaturas c JOIN vagas v ON v.id=c.vaga_id WHERE v.recrutador_id=$ANA_ID LIMIT 1" 2>/dev/null | tr -d '\r')
log "  candidatura_id=$CAND_ID"
STAT_UP=$(status PUT "/recrutador/candidaturas/$CAND_ID/status" '{"status":"ENTREVISTA"}')
[[ "$STAT_UP" == "200" ]] && ok "PUT status candidatura -> 200" || fail "PUT status candidatura -> $STAT_UP"

# 16. VAGAS SALVAS ============================================================
log "16) Salvar / listar / remover vaga salva"
SAL=$(status POST /vagas/salvar "{\"usuario_id\":$LUCAS_ID,\"vaga_id\":$VAGA_ID}")
[[ "$SAL" == "200" || "$SAL" == "201" || "$SAL" == "400" ]] && ok "POST /vagas/salvar -> $SAL" || fail "POST /vagas/salvar -> $SAL"
LISTAR_SAL=$(status GET "/vagas/salvas/$LUCAS_ID")
[[ "$LISTAR_SAL" == "200" ]] && ok "GET /vagas/salvas -> 200" || fail "GET /vagas/salvas -> $LISTAR_SAL"

# 17. LOGIN SOCIAL (deve redirecionar) ========================================
log "17) Login social - GET /auth/social/google/login"
SOC=$(curl -sS -o /dev/null -w '%{http_code}' "$API/auth/social/google/login")
# Em DEV_MODE pode dar 503 ou similar; se OAuth não tá configurado, esperamos 4xx/5xx graceful
if [[ "$SOC" =~ ^(200|302|307|400|503)$ ]]; then
  ok "/auth/social/google/login -> $SOC (graceful)"
else
  fail "/auth/social/google/login -> $SOC (não esperado)"
fi

# 18. DELEÇÃO DE CONTA ========================================================
log "18) Deletar conta de teste criada (cleanup)"
if [[ -n "$NOVO_ID" && "$NOVO_ID" != "0" ]]; then
  DEL_USR=$(status DELETE "/usuarios/$NOVO_ID")
  [[ "$DEL_USR" == "200" ]] && ok "DELETE /usuarios/$NOVO_ID -> 200" || fail "DELETE /usuarios/$NOVO_ID -> $DEL_USR"
fi
if [[ -n "$REC_ID" && "$REC_ID" != "0" ]]; then
  status DELETE "/usuarios/$REC_ID" > /dev/null
fi

# ============================================================================
echo
echo "================================================================"
echo "RESUMO: $PASS passou, $FAIL falhou"
echo "================================================================"
for r in "${RESULTS[@]}"; do echo "  $r"; done
echo
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
