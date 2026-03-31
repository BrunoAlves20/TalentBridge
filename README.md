# 🚀 TalentBridge - Plataforma de Recrutamento Inteligente

O **TalentBridge** é uma aplicação moderna que conecta candidatos e recrutadores através de uma interface intuitiva e processamento inteligente de dados. O projeto utiliza **FastAPI** no backend, **Next.js** no frontend e **MySQL** como banco de dados.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | Next.js 15+, TypeScript, TailwindCSS, Lucide-React |
| **Backend** | Python 3.11+, FastAPI, PyPDF2, Google Gemini API |
| **Banco de Dados** | MySQL 8.0+ |

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (v18 ou superior)
*   [Python](https://www.python.org/) (v3.11 ou superior)
*   [MySQL Server](https://www.mysql.com/) ativo e rodando

---

## 📂 Configuração do Banco de Dados

1.  Abra o seu cliente MySQL (MySQL Workbench, DBeaver ou terminal).
2.  Crie um novo banco de dados chamado `talentbridge`.
3.  Importe o arquivo SQL localizado em: `/database/Database/db.sql`.
4.  Certifique-se de que as credenciais no backend coincidam com as do seu banco local.

---

## ⚙️ Passo a Passo: Backend (FastAPI)

Abra um terminal no VS Code e siga os comandos abaixo:

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Crie um ambiente virtual (recomendado):**
    ```bash
    python -m venv venv
    ```

3.  **Ative o ambiente virtual:**
    *   Windows: venv\Scripts\activate
    *   Linux/Mac: `source venv/bin/activate`

4.  **Instale as dependências:**
    ```bash
    pip install fastapi uvicorn mysql-connector-python bcrypt python-dotenv google-genai PyPDF2 python-multipart "pydantic[email]"
    ```

5.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes chaves:
    ```env
    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=talentbridge
    GEMINI_API_KEY=sua_chave_api_aqui
    ```

6.  **Inicie o servidor:**
    ```bash
    uvicorn main:app --reload
    ```
    *O backend estará rodando em: `http://127.0.0.1:8000`*

---

## 💻 Passo a Passo: Frontend (Next.js)

Abra um **segundo terminal** no VS Code e siga os comandos abaixo:

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend
    ```

2.  **Instale as dependências do Node:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    *O frontend estará acessível em: `http://localhost:3000`*

---

## 🔍 Estrutura de Pastas

*   `/backend`: API robusta com FastAPI, rotas de autenticação e serviços de IA.
*   `/frontend`: Aplicação Next.js com áreas separadas para candidatos e recrutadores.
*   `/database`: Scripts SQL para inicialização do banco de dados.
*   `/docs`: Documentação técnica e roteiros de integração.

---

**Desenvolvido com foco em escalabilidade e experiência do usuário.**
