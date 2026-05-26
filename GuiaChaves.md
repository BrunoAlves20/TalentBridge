# Guia de Obtenção de Chaves — `.env` do Backend

Todas as variáveis necessárias para rodar o TalentBridge completo, com o passo a passo para conseguir cada uma.

---

## 1. JWT_SECRET

Não é obtido em nenhum serviço externo — você mesmo gera.

**Gerar no terminal:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Cole o resultado no `.env`:
```
JWT_SECRET=a1b2c3d4e5f6...  # string de 64 caracteres hexadecimais
JWT_EXPIRE_MINUTES=60
```

> Use uma string longa e aleatória. Nunca compartilhe nem versione esse valor.

---

## 2. Google Client ID e Secret

### Passo a passo

1. Acesse [https://console.cloud.google.com](https://console.cloud.google.com)
2. Clique em **Selecionar projeto** (topo da página) → **Novo projeto**
   - Nome: `TalentBridge` → **Criar**
3. No menu lateral: **APIs e serviços → Tela de permissão OAuth**
   - Tipo de usuário: **Externo** → **Criar**
   - Preencha: Nome do app (`TalentBridge`), e-mail de suporte, e-mail do desenvolvedor
   - Clique em **Salvar e continuar** nas próximas telas (escopos e usuários de teste podem ficar vazios por enquanto)
4. No menu lateral: **APIs e serviços → Credenciais**
   - Clique em **+ Criar credenciais → ID do cliente OAuth**
   - Tipo de aplicativo: **Aplicativo da Web**
   - Nome: `TalentBridge Backend`
   - Em **URIs de redirecionamento autorizados**, adicione:
     ```
     http://localhost:8000/auth/social/google/callback
     ```
   - Clique em **Criar**
5. Uma janela exibe o **ID do cliente** e a **Chave secreta do cliente**

```
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/social/google/callback
```

### Para produção
Adicione também a URI de produção nas URIs de redirecionamento:
```
https://api.seudominio.com/auth/social/google/callback
```

---

## 3. LinkedIn Client ID e Secret

### Passo a passo

1. Acesse [https://www.linkedin.com/developers](https://www.linkedin.com/developers)
2. Clique em **Create app**
   - App name: `TalentBridge`
   - LinkedIn Page: associe a uma página do LinkedIn (pode criar uma página de empresa simples)
   - App logo: faça upload de qualquer imagem
   - Marque o checkbox de conformidade → **Create app**
3. Na aba **Auth** do app criado:
   - Copie o **Client ID** e o **Client Secret**
   - Em **OAuth 2.0 settings → Authorized redirect URLs**, clique em **+ Add redirect URL**:
     ```
     http://localhost:8000/auth/social/linkedin/callback
     ```
   - Salve
4. Na aba **Products**:
   - Localize **Sign In with LinkedIn using OpenID Connect**
   - Clique em **Request access** (aprovação é imediata)
   - Após aprovado, os escopos `openid`, `profile` e `email` ficam disponíveis

```
LINKEDIN_CLIENT_ID=xxxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/social/linkedin/callback
```

> **Atenção em desenvolvimento:** o LinkedIn só permite login de e-mails cadastrados como "testers" do app enquanto ele não estiver em produção. Adicione seu e-mail em **Settings → App → Authorized users**.

---

## 4. Gemini API Key (Google AI)

1. Acesse [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Clique em **Create API key**
3. Selecione o mesmo projeto Google Cloud criado no passo 2 (ou crie um novo)
4. Copie a chave gerada

```
GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> O plano gratuito do Gemini é suficiente para testes (15 req/min, 1.500 req/dia).

---

## 5. Hunter.io API Key (validação de e-mails)

1. Acesse [https://hunter.io](https://hunter.io) e crie uma conta gratuita
2. No painel, vá em **API → API Key**
3. Copie a chave

```
HUNTER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> O plano gratuito permite 25 verificações/mês. Para testes é suficiente.

---

## 6. SMTP Gmail (envio de e-mails OTP)

O Gmail exige uma **Senha de App** — não use sua senha normal da conta.

### Pré-requisito: ativar autenticação de 2 fatores
1. Acesse [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Em **Como você faz login no Google**, ative a **Verificação em duas etapas**

### Gerar a Senha de App
1. Acesse [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Em **Selecionar app**, escolha **Outro (nome personalizado)**
3. Digite `TalentBridge` → **Gerar**
4. Uma senha de 16 caracteres (sem espaços) é exibida — copie agora, ela não aparecerá novamente

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASS=abcdabcdabcdabcd   # senha de app de 16 chars, sem espaços
EMAIL_FROM=TalentBridge <seuemail@gmail.com>
```

---

## 7. Banco de Dados MySQL

Sem chave externa — são as credenciais do seu MySQL local ou do container Docker.

```
DB_HOST=host.docker.internal   # use localhost se não estiver em Docker
DB_USER=root                   # ou o usuário que você criou
DB_PASSWORD=sua_senha_mysql
DB_NAME=talentbridge
DB_PORT=3306
```

---

## 8. FRONTEND_URL

URL base do frontend. Usada pelo backend para redirecionar após o callback OAuth.

```
FRONTEND_URL=http://localhost:3000   # desenvolvimento
# FRONTEND_URL=https://seudominio.com  # produção
```

---

## `.env` completo de referência

```env
# ── Banco de Dados ─────────────────────────────────────
DB_HOST=host.docker.internal
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=talentbridge
DB_PORT=3306

# ── JWT ────────────────────────────────────────────────
JWT_SECRET=cole_aqui_o_resultado_do_secrets_token_hex_32
JWT_EXPIRE_MINUTES=60

# ── Gemini ─────────────────────────────────────────────
GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Hunter.io ──────────────────────────────────────────
HUNTER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── SMTP Gmail ─────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASS=abcdabcdabcdabcd
EMAIL_FROM=TalentBridge <seuemail@gmail.com>

# ── Google OAuth ───────────────────────────────────────
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/social/google/callback

# ── LinkedIn OAuth ─────────────────────────────────────
LINKEDIN_CLIENT_ID=xxxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/social/linkedin/callback

# ── Frontend ───────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
```

---

## Checklist de configuração

| Variável | Fonte | Gratuito? |
|---|---|---|
| `JWT_SECRET` | Gerado localmente (`secrets.token_hex`) | ✅ |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google Cloud Console | ✅ |
| `LINKEDIN_CLIENT_ID` / `SECRET` | LinkedIn Developers | ✅ |
| `GEMINI_API_KEY` | Google AI Studio | ✅ (com limites) |
| `HUNTER_API_KEY` | hunter.io | ✅ (25/mês) |
| `SMTP_PASS` | Gmail → Senha de App | ✅ |
| `DB_*` | Credenciais locais/Docker | ✅ |
| `FRONTEND_URL` | Configuração manual | ✅ |