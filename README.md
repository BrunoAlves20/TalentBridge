# 🚀 TalentBridge - Plataforma de Recrutamento Inteligente

O **TalentBridge** é uma aplicação moderna que conecta candidatos e recrutadores através de uma interface intuitiva e processamento inteligente de dados. O projeto utiliza **FastAPI** no backend, **Next.js** no frontend e **MySQL** como banco de dados.

> ⚙️ **O projeto está configurado em Modo de Desenvolvimento (DEV_MODE).** Nesse modo, nenhum serviço externo é necessário: qualquer e-mail é aceito, o código OTP é sempre `000000` e os botões de login social ficam desativados. Para rodar em produção real, consulte a seção [Modo de Produção](#-modo-de-produção) abaixo.

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
- Chave de API do [Google Gemini](https://aistudio.google.com/app/apikey) — **opcional em DEV_MODE**

> A partir desta versão, o **MySQL roda como um serviço do Docker Compose** — você não precisa mais instalar MySQL na máquina. Quem já tinha MySQL local pode continuar usando alterando `DB_HOST` para `host.docker.internal` no `.env`.

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
- Password: `1234`
- Database: `talentbridge`

---

## ⚙️ Configuração do ambiente

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd TalentBridge
```

2. Copie os arquivos de exemplo e preencha suas credenciais:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Abra o `backend/.env`. Para rodar **apenas com Docker Compose** (recomendado), os valores padrão já apontam para o MySQL containerizado. Você só precisa de:

```env
# Banco — o docker-compose sobrescreve DB_HOST=db automaticamente
DB_USER=root
DB_PASSWORD=1234
DB_NAME=talentbridge
DB_PORT=3306

# JWT — gere com:  python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET=substitua_por_uma_string_aleatoria

# IA — opcional em DEV_MODE (simulador e extração de CV funcionam offline)
GEMINI_API_KEY=

# DEV_MODE=true → OTP fixo 000000, sem Hunter.io, sem SMTP, social desativado
DEV_MODE=true
```

> Se você prefere usar um MySQL já instalado na sua máquina, comente o serviço `db` no `docker-compose.yml` e defina `DB_HOST=host.docker.internal` no `.env`.

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
| **MySQL (no container)** | localhost:3307 (root / `1234` por padrão) |

> ⚠ O MySQL do Docker é exposto na porta **3307** para não conflitar com um MySQL local na porta 3306, caso você já tenha um.

---

## ⚙️ Modo de Desenvolvimento (DEV_MODE)

O projeto já vem com o **Modo de Desenvolvimento ativo** para facilitar testes locais sem depender de serviços externos. Veja o que muda:

| Funcionalidade | Produção | DEV_MODE ativo |
| :--- | :--- | :--- |
| Validação de e-mail | Hunter.io verifica o e-mail | Qualquer e-mail é aceito |
| Envio de OTP | Código aleatório via SMTP/Gmail | Código fixo `000000` no banco |
| Modal de verificação | Usuário digita o código recebido | Campos pré-preenchidos com `000000` |
| Botão Google | Redireciona para OAuth Google | Exibe aviso `⚙ modo dev` e não redireciona |
| Botão LinkedIn | Redireciona para OAuth LinkedIn | Exibe aviso `⚙ modo dev` e não redireciona |

Nenhum código de produção é removido — tudo é apenas desviado condicionalmente. Para voltar ao comportamento real, veja a seção abaixo.

---

## 🏭 Modo de Produção

Para rodar o sistema com todos os serviços reais (e-mail, validação de e-mail, login social), siga os passos:

### 1. Obtenha as chaves de API necessárias

Consulte o arquivo **`GuiaChaves.md`** na raiz do projeto — ele contém o passo a passo para obter cada credencial:
- Chave do **Google Gemini** (IA para extração de currículos)
- Chave do **Hunter.io** (validação de e-mails)
- **Senha de App do Gmail** (envio de e-mails OTP)
- **Client ID e Secret do Google** (login social)
- **Client ID e Secret do LinkedIn** (login social)

### 2. Preencha o `backend/.env` com todas as credenciais

Abra o .env e no final coloque o DEV_MODE=false

### 3. Desative o DEV_MODE no frontend

Abra `frontend/.env.local` e altere:
```env
NEXT_PUBLIC_DEV_MODE=false
```

### 4. Reinicie os containers

```bash
docker compose down && docker compose up --build
```

> Nenhum outro arquivo precisa ser alterado. A troca de `true` para `false` nas variáveis de ambiente é suficiente para ativar o comportamento completo de produção.

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
| `JWT_SECRET` | String secreta para geração de tokens JWT |
| `JWT_EXPIRE_MINUTES` | Tempo de expiração do token JWT em minutos |
| `HUNTER_API_KEY` | Chave do Hunter.io para validação de e-mails |
| `SMTP_HOST` | Servidor SMTP para envio de e-mails |
| `SMTP_PORT` | Porta do servidor SMTP |
| `SMTP_USER` | E-mail remetente |
| `SMTP_PASS` | Senha de App do Gmail |
| `EMAIL_FROM` | Nome e endereço exibidos no e-mail enviado |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth |
| `GOOGLE_REDIRECT_URI` | URI de callback do Google OAuth |
| `LINKEDIN_CLIENT_ID` | Client ID do LinkedIn OAuth |
| `LINKEDIN_CLIENT_SECRET` | Client Secret do LinkedIn OAuth |
| `LINKEDIN_REDIRECT_URI` | URI de callback do LinkedIn OAuth |
| `FRONTEND_URL` | URL pública do frontend, usada nos redirecionamentos OAuth |
| `CORS_ORIGINS` | Lista de origens permitidas, separadas por vírgula |
| `DEV_MODE` | `true` ativa OTP fixo `000000`, mock de Hunter/Gemini, social desativado |
| `NEXT_PUBLIC_API_URL` | (frontend) URL do backend, inlinada no bundle Next em build time |
| `NEXT_PUBLIC_DEV_MODE` | (frontend) `true` mostra banner "DEV" e pré-preenche OTP no modal |
| `FRONTEND_URL` | URL do frontend (usada pelo backend no redirect OAuth) |
| `DEV_MODE` | `true` = modo de desenvolvimento / `false` = produção real |

---

## 🧠 Simulador de Entrevistas com IA

O simulador (`/simulator`) conduz uma entrevista técnica + comportamental usando o Google Gemini, persiste cada sessão no banco e gera um feedback final em formato STAR.

| Endpoint | Método | Descrição |
| :--- | :--- | :--- |
| `/simulador/sessoes` | `POST` | Cria uma sessão e devolve a saudação inicial |
| `/simulador/sessoes` | `GET` | Lista sessões do usuário autenticado |
| `/simulador/sessoes/{id}` | `GET` | Detalhe da sessão (mensagens + status) |
| `/simulador/sessoes/{id}/mensagens` | `POST` | Envia resposta e recebe a próxima pergunta |
| `/simulador/sessoes/{id}/finalizar` | `POST` | Encerra a sessão e gera o feedback final |
| `/simulador/sessoes/{id}` | `DELETE` | Exclui a sessão e todas as mensagens |

> Em **DEV_MODE** o simulador usa perguntas e feedback determinísticos — você não precisa de chave Gemini para testar.

---

**Desenvolvido com foco em escalabilidade e experiência do usuário.**