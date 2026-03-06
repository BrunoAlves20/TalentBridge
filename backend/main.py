from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil # Para salvar o arquivo localmente
import bcrypt
import uuid
from database import get_db_connection
import json
from typing import List, Optional
import mysql.connector


app = FastAPI(title="TalentBridge API")

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://192.168.56.1:3000" # <-- O IP que apareceu no seu erro!
    ],
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (POST, GET, PUT, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# Modelo de dados que a API vai receber
class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    tipo_usuario: str # CANDIDATO ou RECRUTADOR

@app.post("/usuarios/cadastro")
def cadastrar_usuario(usuario: UsuarioCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Verificar se o e-mail já existe (já que o campo é UNIQUE)
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (usuario.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado")

        # 2. Gerar ID e Hash da Senha
        senha_hash = bcrypt.hashpw(usuario.senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # 3. Inserir no banco respeitando a nova estrutura
        # Agora não passamos mais o campo 'id', o banco cuida disso!
        query = """
            INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario)
            VALUES (%s, %s, %s, %s)
        """
        valores = (usuario.nome, usuario.email, senha_hash, usuario.tipo_usuario)
        
        cursor.execute(query, valores)
        conn.commit()
        
        # 4. Pegar o ID sequencial que o MySQL acabou de gerar para devolver na resposta
        novo_id = cursor.lastrowid
        
        return {"mensagem": "Usuário cadastrado com sucesso no TalentBridge!", "id": novo_id}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# Crie este modelo lá em cima junto com os outros (abaixo de UsuarioCreate)
class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

# Adicione a nova Rota de Login
@app.post("/usuarios/login")
def login_usuario(dados: UsuarioLogin):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Busca o usuário pelo e-mail
        cursor.execute("SELECT id, nome, email, senha_hash, tipo_usuario FROM usuarios WHERE email = %s", (dados.email,))
        usuario = cursor.fetchone()

        # 2. Verifica se o e-mail existe
        if not usuario:
            raise HTTPException(status_code=401, detail="E-mail não encontrado.")

        # 3. Verifica se a senha bate com o Hash salvo no banco
        senha_valida = bcrypt.checkpw(dados.senha.encode('utf-8'), usuario['senha_hash'].encode('utf-8'))
        if not senha_valida:
            raise HTTPException(status_code=401, detail="Senha incorreta.")

        # 4. Retorna os dados do usuário para o Frontend saber para onde redirecionar
        return {
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario["id"],
                "nome": usuario["nome"],
                "email": usuario["email"],
                "tipo_usuario": usuario["tipo_usuario"]
            }
        }

    except HTTPException:
        raise # Repassa os erros 401 que criamos acima
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# Cria a pasta 'uploads' na raiz do backend se ela não existir
os.makedirs("uploads", exist_ok=True)

class ExperienciaCreate(BaseModel):
    empresa: str
    cargo: str
    data_inicio: str # Formato YYYY-MM-DD
    data_fim: Optional[str] = None # Se for nulo, significa "Em andamento"
    descricao: Optional[str] = None

class FormacaoCreate(BaseModel):
    instituicao: str
    curso: str
    tipo: str # Ex: Bacharelado, Tecnólogo
    data_inicio: str
    data_fim: Optional[str] = None

class CursoCreate(BaseModel):
    nome: str
    instituicao: str

class IdiomaCreate(BaseModel):
    idioma: str
    nivel: str # Ex: Básico, Intermediário, Fluente

class DadosAreaCandidato(BaseModel):
    usuario_id: int
    telefone: str
    sobre_voce: str
    habilidades: List[str] # Lista de nomes de habilidades
    experiencias: List[ExperienciaCreate]
    formacoes: List[FormacaoCreate]
    cursos: List[CursoCreate]
    idiomas: List[IdiomaCreate]

class RedeSocialCreate(BaseModel):
    nome_rede: str
    url: str

class PerfilPessoalUpdate(BaseModel):
    usuario_id: int
    nome: str # Caso o usuário queira corrigir o nome que digitou no cadastro
    sobrenome: str
    telefone: str
    email_contato: str
    situacao_empregaticia: str
    estado: str
    cidade: str
    redes_sociais: List[RedeSocialCreate]

@app.post("/candidatos/area")
async def salvar_area_candidato(
    dados_json: str = Form(...), # Recebemos tudo como uma string JSON
    curriculo: UploadFile = File(None)
):
    # 1. Converter a string JSON para o nosso modelo estruturado Pydantic
    try:
        dados_dict = json.loads(dados_json)
        dados = DadosAreaCandidato(**dados_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro no formato do JSON: {str(e)}")

    # 2. VALIDAÇÃO DE HABILIDADES
    # ---------------------------------------------------------------------
    # Altere o valor da variável abaixo para mudar o limite no futuro.
    LIMITE_HABILIDADES = 2 
    # ---------------------------------------------------------------------
    if len(dados.habilidades) > LIMITE_HABILIDADES:
        raise HTTPException(status_code=400, detail=f"Você só pode adicionar no máximo {LIMITE_HABILIDADES} habilidades por enquanto.")

    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    cursor = conn.cursor()
    caminho_arquivo = None

    try:
        # 3. Salvar o PDF
        if curriculo:
            if not curriculo.filename.endswith(".pdf"):
                raise HTTPException(status_code=400, detail="O currículo deve ser PDF.")
            
            nome_arquivo = f"user_{dados.usuario_id}_{curriculo.filename}"
            caminho_arquivo = f"uploads/{nome_arquivo}"
            with open(caminho_arquivo, "wb") as buffer:
                shutil.copyfileobj(curriculo.file, buffer)

        # 4. Inserir Perfil Base (Sobre Você)
        query_perfil = """
            INSERT INTO perfis_candidatos (usuario_id, telefone, sobre_voce, url_curriculo_s3)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
            telefone = VALUES(telefone),
            sobre_voce = VALUES(sobre_voce),
            url_curriculo_s3 = COALESCE(VALUES(url_curriculo_s3), url_curriculo_s3)
        """
        cursor.execute(query_perfil, (dados.usuario_id, dados.telefone, dados.sobre_voce, caminho_arquivo))

        # LIMPEZA DAS LISTAS ANTIGAS: Deleta as relações anteriores para inserir as novas sem duplicidade
        cursor.execute("DELETE FROM experiencias WHERE usuario_id = %s", (dados.usuario_id,))
        cursor.execute("DELETE FROM formacoes WHERE usuario_id = %s", (dados.usuario_id,))
        cursor.execute("DELETE FROM cursos_certificacoes WHERE usuario_id = %s", (dados.usuario_id,))
        cursor.execute("DELETE FROM idiomas WHERE usuario_id = %s", (dados.usuario_id,))
        cursor.execute("DELETE FROM candidato_habilidades WHERE usuario_id = %s", (dados.usuario_id,))
        # -------------------------------

        # 5. Inserir Experiências
        for exp in dados.experiencias:
            cursor.execute("""
                INSERT INTO experiencias (usuario_id, empresa, cargo, data_inicio, data_fim, descricao)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (dados.usuario_id, exp.empresa, exp.cargo, exp.data_inicio, exp.data_fim, exp.descricao))

        # 6. Inserir Formações
        for form in dados.formacoes:
            cursor.execute("""
                INSERT INTO formacoes (usuario_id, instituicao, curso, tipo, data_inicio, data_fim)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (dados.usuario_id, form.instituicao, form.curso, form.tipo, form.data_inicio, form.data_fim))

        # 7. Inserir Cursos
        for curso in dados.cursos:
            cursor.execute("""
                INSERT INTO cursos_certificacoes (usuario_id, nome, instituicao)
                VALUES (%s, %s, %s)
            """, (dados.usuario_id, curso.nome, curso.instituicao))

        # 8. Inserir Idiomas
        for idioma in dados.idiomas:
            cursor.execute("""
                INSERT INTO idiomas (usuario_id, idioma, nivel)
                VALUES (%s, %s, %s)
            """, (dados.usuario_id, idioma.idioma, idioma.nivel))

        # 9. Inserir Habilidades (Dicionário e Relacionamento)
        for hab_nome in dados.habilidades:
            # Verifica se a habilidade já existe no banco
            cursor.execute("SELECT id FROM habilidades WHERE nome = %s", (hab_nome.upper(),))
            resultado = cursor.fetchone()
            
            if resultado:
                hab_id = resultado[0]
            else:
                # Se não existe, cria a habilidade
                cursor.execute("INSERT INTO habilidades (nome) VALUES (%s)", (hab_nome.upper(),))
                hab_id = cursor.lastrowid
            
            # Vincula a habilidade ao candidato
            cursor.execute("INSERT INTO candidato_habilidades (usuario_id, habilidade_id) VALUES (%s, %s)", (dados.usuario_id, hab_id))

        conn.commit()
        return {"mensagem": "Área do candidato salva com sucesso e currículo processado!"}

    except mysql.connector.IntegrityError as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro de integridade de dados (Ex: perfil já existe): {e}")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.put("/candidatos/perfil-pessoal")
def atualizar_perfil_pessoal(dados: PerfilPessoalUpdate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    cursor = conn.cursor()

    try:
        # 1. Atualizar o Nome na tabela 'usuarios'
        cursor.execute("UPDATE usuarios SET nome = %s WHERE id = %s", (dados.nome, dados.usuario_id))

        # 2. Inserir ou Atualizar os dados na tabela 'perfis_candidatos'
        # Usamos ON DUPLICATE KEY UPDATE para garantir que, se o perfil já existir, ele apenas atualize.
        query_perfil = """
            INSERT INTO perfis_candidatos 
            (usuario_id, sobrenome, telefone, email_contato, situacao_empregaticia, estado, cidade)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
            sobrenome=VALUES(sobrenome), 
            telefone=VALUES(telefone), 
            email_contato=VALUES(email_contato), 
            situacao_empregaticia=VALUES(situacao_empregaticia),
            estado=VALUES(estado), 
            cidade=VALUES(cidade)
        """
        valores_perfil = (
            dados.usuario_id, dados.sobrenome, dados.telefone, 
            dados.email_contato, dados.situacao_empregaticia, 
            dados.estado, dados.cidade
        )
        cursor.execute(query_perfil, valores_perfil)

        # 3. Atualizar Redes Sociais
        # A forma mais segura é deletar as antigas e inserir as novas que vieram do frontend
        cursor.execute("DELETE FROM redes_sociais WHERE usuario_id = %s", (dados.usuario_id,))
        
        for rede in dados.redes_sociais:
            cursor.execute("""
                INSERT INTO redes_sociais (usuario_id, nome_rede, url)
                VALUES (%s, %s, %s)
            """, (dados.usuario_id, rede.nome_rede, rede.url))

        conn.commit()
        return {"mensagem": "Perfil pessoal atualizado com sucesso!"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar perfil pessoal: {str(e)}")
    finally:
        cursor.close()
        conn.close()

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

@app.post("/usuarios/login")
def login_usuario(credenciais: LoginRequest):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Busca o usuário pelo e-mail
        cursor.execute("SELECT id, nome, senha_hash, tipo_usuario FROM usuarios WHERE email = %s", (credenciais.email,))
        usuario = cursor.fetchone()
        
        # Verifica se o usuário existe e se a senha está correta
        if not usuario or not bcrypt.checkpw(credenciais.senha.encode('utf-8'), usuario['senha_hash'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
            
        return {
            "mensagem": "Login efetuado com sucesso!",
            "usuario_id": usuario['id'],
            "nome": usuario['nome'],
            "tipo_usuario": usuario['tipo_usuario']
        }
    finally:
        cursor.close()
        conn.close()

# Rota para obter o perfil pessoal do candidato, incluindo nome, sobrenome, telefone, email de contato, situação empregatícia, estado e cidade
@app.get("/candidatos/perfil-pessoal/{usuario_id}")
def obter_perfil_pessoal(usuario_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Faz um JOIN para pegar o nome do usuário e os dados do perfil dele
        query = """
            SELECT u.nome, p.sobrenome, p.telefone, p.email_contato, p.situacao_empregaticia, p.estado, p.cidade
            FROM usuarios u
            LEFT JOIN perfis_candidatos p ON u.id = p.usuario_id
            WHERE u.id = %s
        """
        cursor.execute(query, (usuario_id,))
        perfil = cursor.fetchone()

        if not perfil:
            raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
        return perfil
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    finally:
        cursor.close()
        conn.close()