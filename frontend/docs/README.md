# Talent Bridge - Frontend MVP

Bem-vindo ao repositório frontend do **Talent Bridge**, uma plataforma inteligente de recrutamento projetada para conectar empresas aos melhores talentos através de tecnologia e inteligência artificial.

Este projeto foi inicializado com [Next.js](https://nextjs.org/) (App Router) e faz uso extensivo do novo Tailwind CSS v4 para estilização com suporte nativo a Light/Dark Mode.

## 🚀 Tecnologias e Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Biblioteca UI:** [React](https://react.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gerenciamento de Tema:** `next-themes` (Dark/Light mode automático e manual)
- **Integração API:** `fetch` nativo integrado com backend FastAPI (Python)

## ✨ Funcionalidades Implementadas (Integração Front/Back)

- **Autenticação Real:** Telas de Login e Cadastro conectadas ao banco de dados MySQL, com roteamento inteligente baseado no tipo de usuário (`CANDIDATO` ou `RECRUTADOR`).
- **Área do Candidato Dinâmica:** Layout com `Sidebar` persistente para navegação fluida.
- **Dashboard de Currículo (`CurriculoFormView`):** Formulário complexo com suporte a listas dinâmicas (experiências, formações, habilidades) e upload de arquivos (PDF)   utilizando `FormData`.
- **Gestão de Perfil (`AreaCandidatoView`):** Tela de perfil pessoal com sistema de bloqueio/edição e carregamento de dados via requisições `GET` e `PUT`.

## 📁 Estrutura do Projeto

O projeto segue uma arquitetura baseada no padrão *Container/View* para organizar rotas e componentes de UI de forma escalável.

```text
frontend/
├── src/
│   ├── app/                 # Rotas do Next.js (App Router) e Layout Global
│   │   ├── (auth)/          # Grupo de rotas de autenticação (Login, Register)
│   │   ├── (candidate)/     # Grupo de rotas do candidato
│   │   │   ├── area-candidato/ # Dashboard Home e setup de Currículo
│   │   │   │   └── perfil/  # Rota para visualização e edição de dados pessoais
│   │   │   └── layout.tsx   # Layout do candidato (Injeta a Sidebar)
│   │   ├── (recruiter)/     # Grupo de rotas do recrutador (Dashboard, Ranking)
│   │   ├── globals.css      # Estilizações globais e variáveis Tailwind
│   │   └── layout.tsx       # Root layout com ThemeProvider
│   ├── components/          # Componentes de UI reutilizáveis (Views)
│   │   ├── auth/            # Views de tela de Login/Registro integradas à API
│   │   ├── candidate/       # Views da área logada do candidato
│   │   │   ├── AreaCandidatoView.tsx # Formulário de Perfil (GET/PUT)
│   │   │   ├── CandidateSidebar.tsx  # Menu de navegação lateral do layout
│   │   │   └── CurriculoFormView.tsx # Formulário dinâmico do Currículo e Upload
│   │   ├── home/            # Componentes da Landing Page
│   │   ├── layout/          # Componentes globais de Layout (Navbar, Footer)
│   │   ├── providers/       # Context Providers (ThemeProvider)
│   │   ├── recruiter/       # Views do Recrutador
│   │   └── ui/              # Componentes base e primitivos (ex: ThemeToggle)
│   ├── data/                # Mock data estático (substituído gradativamente pela API)
│   ├── hooks/               # Custom React hooks (lógica cliente isolada)
│   ├── services/            # Camada de requisições à API (ex: auth.ts comunicando com a porta 8000)
│   ├── types/               # Definições de Tipos/Interfaces do TypeScript
│   └── utils/               # Funções auxiliares gerais
├── public/                  # Assets estáticos (imagens, favicons, etc.)
├── tailwind.config.ts       # Configurações do TailwindCSS
└── tsconfig.json            # Configurações do TypeScript (Path aliases configurados para `@/*`)
```

## ⚙️ Pré-requisitos

Para rodar este projeto, você precisa ter instalado no seu ambiente:
- [Node.js](https://nodejs.org/) (versão 18.17 ou superior)
- Gerenciador de pacotes NPM (que acompanha o Node.js) ou `yarn`/`pnpm`/`bun`.

## 🛠️ Como rodar o projeto localmente

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd TalentBridge/frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

4. **Acesse a aplicação**
   Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000). A página recarregará automaticamente ao salvar os arquivos (Hot Reload).

##  scripts Disponíveis

No diretório do projeto, você pode rodar os seguintes comandos:

- `npm run dev` - Roda o app em modo de desenvolvimento.
- `npm run build` - Compila o projeto para o formato de produção, otimizando de forma estática o que for possível.
- `npm run start` - Inicia o servidor Node em modo de produção (após rodar o build).
- `npm run lint` - Executa a verificação de código do ESLint para encontrar e arrumar problemas.

## 🤝 Contribuições e Boas Práticas

Para os desenvolvedores e colaboradores do projeto, por favor leiam com atenção as seguintes diretrizes:

1. **Server vs Client Components:** Por padrão, todos os componentes do `app/` no Next.js são Server Components. Use a diretiva `"use client"` **apenas** quando precisar de *React Hooks* (useState, useEffect) ou manipulação direta de eventos no DOM (onClick, onChange).
2. **Container/View Pattern:**
   - Mantenha os arquivos `page.tsx` limpos. Eles devem servir apenas para lidar com Metadata e buscar dados (Data Fetching).
   - A interface do usuário deve ser construída criando arquivos na pasta `src/components/...` e importada no `page.tsx`.
3. **Estilização e Tailwind:** Utilize classes Utilitárias do Tailwind. Todas as cores padrões do projeto devem utilizar as referências de opacidade da classe raiz do projeto para que o **Light/Dark theme** funcione normalmente sem problemas de refatoração futuras.
4. **Resolução de Conflitos e Pull Requests:** Evite commitar diretamente na branch `main`. Crie uma `feature/nome-da-feature` e abra um PR para revisão.

---

**Desenvolvido pelo time da Talent Bridge.**
