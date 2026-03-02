# TalentBridge

Sistema de Cadastro de Currículo com Banco de Talentos e Entrevista
feita por IA.

Uma plataforma inteligente que automatiza a triagem de candidatos e
oferece simulação de entrevistas com feedback, tornando o processo mais
rápido, assertivo e vantajoso tanto para empresas quanto para
candidatos.

------------------------------------------------------------------------

## 🛠️ Tecnologias Utilizadas

-   **Frontend:** Next.js (React)\
-   **Backend:** Python\
-   **Banco de Dados:** MySQL\
-   **Armazenamento:** AWS S3

------------------------------------------------------------------------

## ⚠️ Atenção: Pré-requisitos para rodar o projeto

Antes de começar, certifique-se de ter as seguintes ferramentas
instaladas na sua máquina:

1.  **Python 3.10+** (Para rodar o backend e a IA)\
2.  **Node.js** (Para rodar o frontend em Next.js)\
3.  **MySQL Server & MySQL Workbench** (Para o banco de dados local)

------------------------------------------------------------------------

## 🔐 Configurando as Variáveis de Ambiente

Por questões de segurança, senhas e chaves não sobem para o repositório.

1.  Na raiz do projeto backend, faça uma cópia do arquivo `.env.example`
    e renomeie a cópia para `.env`.
2.  Abra o novo arquivo `.env` e preencha as variáveis com os dados do
    seu banco MySQL local (exemplo: `DB_USER=root`,
    `DB_PASSWORD=sua_senha`).

------------------------------------------------------------------------

## 🐍 Configurando o Backend (Python)

É uma **boa prática obrigatória** utilizarmos um Ambiente Virtual
(`venv`) para isolar as bibliotecas (como FastAPI, SQLAlchemy,
bibliotecas de IA, etc.) do sistema operacional.

### Passo 1: Criar o ambiente virtual

Abra o terminal na pasta do backend e execute:

``` bash
python -m venv venv
```

------------------------------------------------------------------------

### Passo 2: Ativar o ambiente virtual

**No Windows:**

``` bash
venv\Scripts\activate
```

**No Linux/Mac:**

``` bash
source venv/bin/activate
```

Você saberá que deu certo quando aparecer `(venv)` no início da linha do
seu terminal.

``` bash
Desativar venv deactivate
```
------------------------------------------------------------------------

### Passo 3: Instalar as dependências

Com o `venv` ativado, instale todas as bibliotecas necessárias:

``` bash
pip install -r requirements.txt 
```

------------------------------------------------------------------------

## 🗄️ Configuração do Banco de Dados (MySQL)

Para garantir que toda a equipe de desenvolvimento utilize a mesma
estrutura de tabelas, siga estes passos:

### Passo 1: Criar a Estrutura do Banco (Tabelas)

1.  Abra o MySQL Workbench e conecte-se à sua instância local.\
2.  Vá em **File \> Open SQL Script...** (ou `Ctrl + Shift + O`).\
3.  Abra o arquivo `database/schema.sql`.\
4.  Clique no ícone do raio amarelo ⚡ para executar.\
5.  Atualize a aba *Schemas* para ver o banco criado.

------------------------------------------------------------------------

### Passo 2: Inserir os Dados de Teste (Seeds)

Para que as telas do frontend tenham dados reais para exibir e testar:

1.  Vá em **File \> Open SQL Script...**\
2.  Abra o arquivo `database/seeds.sql`.\
3.  Clique no ícone do raio amarelo ⚡ para executar.

Pronto! O banco já possui usuários de teste, habilidades e vagas
cadastradas.
