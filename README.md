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

## ⚙️ Configuração do ambiente

```bash
git clone <url-do-repositorio>
cd TalentBridge
cp .env.example .env
```

Abra o `.env` e preencha seus dados. O único campo que muda entre os dois modos é o `DB_HOST` — veja a seção abaixo.

---

## 🗄️ Modos de Banco de Dados

O projeto suporta dois modos. A troca é feita alterando **apenas `DB_HOST`** no `.env`.

---

### 🐳 Modo Docker (padrão)

O MySQL sobe automaticamente como container junto com o projeto. Ideal para quem não tem MySQL instalado na máquina.

**No `.env`:**
```env
DB_HOST=db
DB_PASSWORD=sua_senha_aqui
```

**Subir o projeto:**
```bash
docker-compose --profile docker-db up --build
```

**Conectar no MySQL Workbench:**
| Campo | Valor |
| :--- | :--- |
| Host | `127.0.0.1` |
| Port | `3307` |
| User | `root` |
| Password | _(a que você definiu no `.env`)_ |

> O banco é criado automaticamente na primeira execução. O schema e todas as tabelas são criados pelo backend ao subir.

---

### 🖥️ Modo Local

Usa o MySQL já instalado na sua máquina. O banco e as tabelas ainda são criados automaticamente pelo backend ao subir — você só precisa que o MySQL esteja rodando.

**No `.env`:**
```env
DB_HOST=host.docker.internal
DB_PASSWORD=sua_senha_do_mysql_local
```

**Subir o projeto:**
```bash
docker-compose up --build
```

**Conectar no MySQL Workbench:**
| Campo | Valor |
| :--- | :--- |
| Host | `127.0.0.1` |
| Port | `3306` |
| User | `root` |
| Password | _(a senha do seu MySQL local)_ |

> Certifique-se de que o MySQL local está rodando antes de subir os containers.

---

## 🚀 Como rodar

### Primeira vez

**Modo Docker:**
```bash
docker-compose --profile docker-db up --build
```

**Modo Local:**
```bash
docker-compose up --build
```

### Nas vezes seguintes (sem mudanças nos Dockerfiles)

**Modo Docker:**
```bash
docker-compose --profile docker-db up
```

**Modo Local:**
```bash
docker-compose up
```

---

## 🌐 Acessos

| Serviço | URL |
| :--- | :--- |
| **Frontend** | http://localhost:3000 |
| **Backend** | http://localhost:8000 |
| **Documentação da API** | http://localhost:8000/docs |
| **MySQL Docker** | localhost:**3307** |
| **MySQL Local** | localhost:**3306** |

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

Nenhum código de produção é removido — tudo é apenas desviado condicionalmente.

---

## 🏭 Modo de Produção

### 1. Obtenha as chaves de API necessárias

Consulte o arquivo **`GuiaChaves.md`** na raiz do projeto:
- Chave do **Google Gemini** (IA para extração de currículos)
- Chave do **Hunter.io** (validação de e-mails)
- **Senha de App do Gmail** (envio de e-mails OTP)
- **Client ID e Secret do Google** (login social)
- **Client ID e Secret do LinkedIn** (login social)

### 2. Preencha o `.env` com todas as credenciais e defina

```env
DEV_MODE=false
NEXT_PUBLIC_DEV_MODE=false
```

### 3. Reinicie os containers

**Modo Docker:**
```bash
docker-compose --profile docker-db down && docker-compose --profile docker-db up --build
```

**Modo Local:**
```bash
docker-compose down && docker-compose up --build
```

---

## 📋 Comandos úteis

Ver logs de um serviço:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Encerrar os containers (mantém os dados):
```bash
docker-compose --profile docker-db down    # Modo Docker
docker-compose down                         # Modo Local
```

Encerrar e apagar o banco Docker (próxima vez começa do zero):
```bash
docker-compose --profile docker-db down -v
```

Rodar em segundo plano:
```bash
docker-compose --profile docker-db up -d   # Modo Docker
docker-compose up -d                        # Modo Local
```

---

## 🔑 Variáveis de Ambiente

Todas as variáveis ficam em **`.env`** na raiz do projeto.

| Variável | Descrição |
| :--- | :--- |
| `DB_HOST` | `db` para Docker / `host.docker.internal` para MySQL local |
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
| `NEXT_PUBLIC_API_URL` | URL do backend, inlinada no bundle Next em build time |
| `NEXT_PUBLIC_DEV_MODE` | `true` mostra banner "DEV" e pré-preenche OTP no modal |
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