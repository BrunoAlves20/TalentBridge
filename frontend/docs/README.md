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

## 📁 Estrutura do Projeto

O projeto segue uma arquitetura baseada no padrão *Container/View* para organizar rotas e componentes de UI de forma escalável.

```text
frontend/
├── docs/                  # Documentação central do Frontend (README.md, assets de doc, guias)
├── public/                # Assets estáticos servidos diretamente na URL raiz (ícones, SVGs, imagens públicas)
├── src/                   # Código fonte principal e arquitetura da aplicação
│   ├── app/                 # Sistema de Rotas Baseado em Arquivos do Next.js (App Router)
│   │   ├── auth/            # Grupo de rotas acessíveis apenas para autenticação (Login, Registro)
│   │   ├── recruiter/       # Grupo de rotas privadas do fluxo de Recrutador (Empregador)
│   │   │   ├── dashboard/   # Tela Principal do Recrutador (Visão Geral de Vagas e Estatísticas)
│   │   │   └── ranking/     # Visão de Tabela e Ranking dos Melhores Candidatos com match IA
│   │   ├── candidate/       # Rotas de acesso direto do Candidato (Pós-login)
│   │   │   ├── dashboard/   # Painel Principal do Candidato logado
│   │   │   ├── simulator/   # Ambiente do Simulador Interativo de Entrevista por IA
│   │   │   └── onboarding/  # Fluxo Responsivo para o Assistente Passo-a-Passos de Perfil
│   │   │       ├── passo1/  # Seleção do Método de Extração (Extração Via IA vs Manual)
│   │   │       ├── passo2/  # Formulário de Dados Pessoais, Links Úteis e Formação Acadêmica
│   │   │       └── passo3/  # Formulário de Experiência Profissional, Hard Skills e Soft Skills
│   │   ├── globals.css      # Folha de Estilos Global (Importações do Tailwind CSS e Variáveis de CSS/Tema)
│   │   └── layout.tsx       # Root Layout que encapsula toda aplicação (fornece ThemeProvider e Fontes)
│   ├── components/          # Reutilizáveis de Interface de Usuário (Views e Fragmentos React)
│   │   ├── auth/            # Blocos Visuais das Telas de Autenticação (Form de Login, Cadastro)
│   │   ├── candidate/       # Componentes Específicos da Experiência do Candidato
│   │   │   ├── dashboard/   # Widgets e Menus do Dashboard (Sidebar do Candidato, CTA do Simulador)
│   │   │   └── onboarding/  # Os componentes principais renderizados em cada Passo do Onboarding
│   │   ├── home/            # Seções Reutilizáveis que formam a Landing Page Pública
│   │   ├── layout/          # Componentes Globalmente Fixos (Navbar Superior, Footer de Rodapé)
│   │   ├── providers/       # Englobadores (Wrappers) Globais com React Context (Contextos Visuais como Tema)
│   │   ├── recruiter/       # Componentes Visuais do Painel do Empregador/Recrutador
│   │   └── ui/              # Componentes "Atômicos" da Base do App (Primitivos como Switch de Temas, Botões Base)
│   ├── contexts/            # Gerenciamento de Estado React Context API isolado da UI
│   │                        # (ex: OnboardingContext persistindo dados entre sessionStorage/localStorage)
│   ├── data/                # Dados Estáticos, Mocks ou Valores Iniciais pré-produção (ex: Mock de Candidatos)
│   ├── services/            # Camada de Regras de Negócio Externas (Funções Fetch para endpoints de API backend)
│   └── types/               # Definições Fortemente Tipadas Globais e Interfaces do TypeScript para DTOs
├── .gitignore             # Regras de pastas ignoradas no mapeamento do versionamento Git
├── eslint.config.mjs      # Configurações de Linting da Equipe (padronização de regras p/ código limpo ESLint)
├── next-env.d.ts          # Declarações Automáticas do Compilador do Next.js para referências Typescript
├── next.config.ts         # Regras de Configuração do Bundler/Build da aplicação NextJS
├── package.json           # Manifesto de Dependências do Projeto Node.js e Scripts Automáticos (dev, build, lint)
├── package-lock.json      # Árvore "Travada" com versões exatas instaladas das dependências base (cache Lockfile)
├── postcss.config.mjs     # Instruções do Compilador/Pré-Processor CSS do Tailwind
├── tailwind.config.ts     # Configuração Visual do Sistema de Design do Tailwind v4 (temas, cores, plugins)
└── tsconfig.json          # Opções rigorosas de Compilação do TypeScript (ex: habilitando Path Aliases `@/*`)
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
