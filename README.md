# 🚀 TalentBridge - Plataforma de Recrutamento Inteligente

O **TalentBridge** é uma aplicação moderna que conecta candidatos e recrutadores através de uma interface intuitiva e processamento inteligente de dados. O projeto utiliza **FastAPI** no backend, **Next.js** no frontend e **MySQL** como banco de dados.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | Next.js 15+, TypeScript, TailwindCSS, Lucide-React |
| **Backend** | Python 3.11+, FastAPI, PyPDF2, Google Gemini API |
| **Banco de Dados** | MySQL 8.0+ |
| **Infraestrutura** | Docker, Docker Compose |

---

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [MySQL](https://www.mysql.com/) instalado e rodando na máquina
- Chave de API do [Google Gemini](https://aistudio.google.com/app/apikey)

---

## 🐋 Instalando o Docker Desktop

1. Acesse [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) e clique em **Download for Windows - AMD64**
2. Execute o `Docker Desktop Installer.exe`
3. Durante a instalação, mantenha marcado **"Use WSL 2 instead of Hyper-V"** (SE APARECER)
4. Após a instalação, **reinicie o PC**
5. Abra o Docker Desktop pelo menu Iniciar e aceite os termos de uso
6. Aguarde a baleia aparecer na barra de tarefas — isso indica que o Docker está pronto

Para verificar se funcionou, abra o terminal e rode:
```bash
docker --version
docker compose version
```

---

## 🧩 Extensão Docker no VS Code (opcional)

Para acompanhar os containers visualmente dentro do VS Code:

1. Abra o VS Code
2. Vá em **Extensões** (`Ctrl + Shift + X`)
3. Pesquise por **Docker** (publicada pela Microsoft) e instale
4. Pesquise por **Database Client** (publicada por Weijan Chen) e instale — permite visualizar e editar as tabelas do banco com interface gráfica

Após instalar, os ícones aparecem na barra lateral do VS Code. Para conectar o Database Client ao banco:
- Host: `127.0.0.1`
- Port: `3306`
- User: `root`
- Password: sua senha do MySQL local
- Database: `talentbridge`

---

## ⚙️ Configuração do ambiente

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd TalentBridge
```

2. Copie o arquivo de exemplo e preencha suas credenciais:
```bash
cp backend/.env.example backend/.env
```

3. Abra o `backend/.env` e preencha:
```env
DB_HOST=host.docker.internal
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=talentbridge
DB_PORT=3306
GEMINI_API_KEY=sua_chave_aqui
```

> O `DB_HOST=host.docker.internal` é obrigatório — é o endereço especial que o Docker usa para acessar o MySQL da sua máquina.

---

## 🚀 Como rodar

### Primeira vez (ou após mudanças nos Dockerfiles)
```bash
docker-compose up --build
```

Este comando vai:
- Construir as imagens do backend e frontend
- Instalar todas as dependências automaticamente
- Criar o banco `talentbridge` e todas as tabelas no seu MySQL local
- Subir o frontend e o backend

### Nas vezes seguintes
```bash
docker-compose up
```

As imagens já estão prontas, então sobe muito mais rápido.

---

## 🌐 Acessos

| Serviço | URL |
| :--- | :--- |
| **Frontend** | http://localhost:3000 |
| **Backend** | http://localhost:8000 |
| **Documentação da API** | http://localhost:8000/docs |

---

## 📋 Comandos úteis

Ver logs de um serviço específico:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Ver containers rodando:
```bash
docker ps
```

Encerrar os containers (mantém os dados):
```bash
docker-compose down
```

Encerrar e apagar tudo (banco zerado na próxima vez):
```bash
docker-compose down -v
```

Rodar em segundo plano (sem travar o terminal):
```bash
docker-compose up -d
```

Acompanhar logs em tempo real no modo segundo plano:
```bash
docker-compose logs -f
```

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição |
| :--- | :--- |
| `DB_HOST` | Host do banco — use `host.docker.internal` com Docker |
| `DB_USER` | Usuário do MySQL |
| `DB_PASSWORD` | Senha do MySQL |
| `DB_NAME` | Nome do banco (padrão: `talentbridge`) |
| `DB_PORT` | Porta do MySQL (padrão: `3306`) |
| `GEMINI_API_KEY` | Chave da API do Google Gemini |

---

**Desenvolvido com foco em escalabilidade e experiência do usuário.**