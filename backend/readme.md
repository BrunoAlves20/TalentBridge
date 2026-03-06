# TalentBridge - Backend API

Este é o backend do projeto **TalentBridge**, desenvolvido em Python utilizando o framework **FastAPI**. A API é responsável por gerenciar a autenticação de usuários, perfis de candidatos, vagas e o motor de simulação de entrevistas com IA.

## 🚀 Tecnologias Utilizadas

* **Linguagem:** Python 3.x
* **Framework API:** FastAPI
* **Servidor Web:** Uvicorn
* **Banco de Dados:** MySQL (via `mysql-connector-python`)
* **Segurança:** Bcrypt (para hash de senhas)
* **Validação de Dados:** Pydantic
* **Upload de Arquivos:** `python-multipart`

## 📁 Estrutura de Diretórios (Backend)

A arquitetura do backend foi desenhada para separar responsabilidades de forma clara:

```text
backend/
├── uploads/              # Diretório local temporário onde os currículos (PDFs) são salvos
├── venv/                 # Ambiente virtual do Python (ignorado no git)
├── .env                  # Variáveis de ambiente e credenciais do banco (ignorado no git)
├── .gitignore            # Arquivos ignorados pelo controle de versão
├── database.py           # Configuração e gerenciamento da conexão com o MySQL
├── main.py               # Arquivo principal contendo a instância do FastAPI e as rotas (Endpoints)
└── talentbridge_tabelas.sql # Script SQL oficial com a modelagem do banco de dados


## 📡 Endpoints da API (Rotas Principais)
POST /usuarios/cadastro: Registra novos Candidatos ou Recrutadores.

POST /usuarios/login: Autentica o usuário e retorna seus dados base.

GET /candidatos/perfil-pessoal/{id}: Retorna os dados pessoais do candidato para edição.

PUT /candidatos/perfil-pessoal: Atualiza ou insere os dados pessoais (nome, telefone, localização).

POST /candidatos/area: Recebe o formulário completo de currículo (experiências, formações, habilidades) e faz o upload do arquivo PDF.

## 🛠️ Como Configurar e Executar o Projeto Localmente
1. Preparando o Banco de Dados
Abra o MySQL Workbench.

Execute o script talentbridge_tabelas.sql para criar o schema talentbridge e todas as tabelas atualizadas com AUTO_INCREMENT.

## Configurando o Ambiente Python
Abra o terminal na pasta backend/ e execute:

Ative o ambiente virtual

```bash
  python -m venv venv
```
No windows
```bash
  venv\Scripts\activate
```
No Linux/Mac:
```bash
  source venv\Scripts\activate
```

# Instale as dependências essenciais
```
pip install fastapi uvicorn mysql-connector-python python-dotenv bcrypt pydantic "pydantic[email]" python-multipart
```

## Variáveis de Ambiente
Crie um arquivo chamado .env na raiz da pasta backend/ com as suas credenciais de acesso ao MySQL, sigar o arquivo .env_example

## Iniciando o Servidor
Com o ambiente virtual ativado, inicie a API com o Uvicorn:
```
Bash
uvicorn main:app --reload
```
A API estará rodando em http://127.0.0.1:8000.
Você pode acessar a documentação interativa e testar as rotas acessando o Swagger UI gerado automaticamente em: http://127.0.0.1:8000/docs.

Caso não entenda como Fucionar só Chamar que ajudo

