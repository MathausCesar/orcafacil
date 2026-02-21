# OrçaFácil - Manual da Aplicação

> Sistema de gestão e emissão de orçamentos (Quotes) com onboarding intuitivo, gestão de clientes e catálogo de serviços.

## 1. Visão Geral
O **OrçaFácil** é uma aplicação web moderna construída para facilitar a criação, personalização e gestão de orçamentos e clientes. O sistema oferece desde o cadastro inicial (onboarding) até a aprovação final do orçamento pelo cliente, suportando opções de pagamento, garantias e catálogos de serviços.

## 2. Stack Tecnológico

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Biblioteca UI:** React 19
- **Estilização:** Tailwind CSS v4, \`tw-animate-css\`
- **Componentes:** Shadcn UI (Radix UI)
- **Ícones:** Lucide React
- **Animações:** Framer Motion
- **Formulários e Validação:** React Hook Form + Zod
- **PWA:** \`@ducanh2912/next-pwa\`

### Backend & Nuvem (BaaS)
- **Plataforma:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth (SSR suportado via \`@supabase/ssr\`)
- **Banco de Dados:** PostgreSQL hospedado no Supabase com Row Level Security (RLS)

### Qualidade e Ferramentas
- **Linguagem:** TypeScript
- **Linting:** ESLint
- **Gerenciador de Pacotes:** npm/yarn/pnpm

---

## 3. Arquitetura e Estrutura

A aplicação segue a arquitetura orientada a componentes do Next.js App Router:
- \`src/app/\`: Rotas da aplicação organizadas por grupos (\`(auth)\`, \`(dashboard)\`, \`(onboarding)\`).
- \`src/components/\`: Componentes reutilizáveis separados por domínio lógico (auth, clients, quotes, onboarding, profile, support, ui).
- \`supabase/migrations/\`: Controle de versão do banco de dados e atualizações de schema (SQL).

---

## 4. Funcionalidades Principais (Features)

### Autenticação e Onboarding
- **Login/Registro:** Autenticação segura via Supabase.
- **Wizard de Onboarding:** Configuração guiada da conta, permitindo que novos usuários cadastrem rapidamente os detalhes da sua empresa, serviços iniciais e templates.

### Gestão de Orçamentos (Quotes)
- **Criação e Edição:** Interface completa para elaborar orçamentos detalhados.
- **Opções de Pagamento:** Configuração flexível de opções de pagamento e parcelamento (installment count).
- **Caixa de Garantia (Warranty):** Especificação de garantias para serviços/produtos oferecidos.
- **Customização visual:** Edição do layout e campos customizados (\`quote_customization_fields\`).
- **Aprovação de Orçamento:** Fluxo de atualização de status do orçamento (\`approve_quote\`).
- **Catálogo de Serviços:** Organização dos serviços/produtos em pastas (\`catalog_folders\`).

### Gestão de Clientes
- **Perfis de Clientes:** Cadastro e gestão de dados de clientes Pessoa Física e Jurídica.
- **Campos Empresariais:** Suporte a CNPJ, Inscrição Estadual e outros dados corporativos (\`company_fields\`).

### Área do Usuário
- **Dashboard:** Visão geral do negócio (indicadores, atalhos contextuais, busca global).
- **Perfil (Profile):** Gestão de dados do usuário e do próprio CNPJ da sua empresa.
- **Suporte:** Sistema integrado de tickets de suporte (\`support_tickets\`).
- **Notificações:** Alertas do sistema (aprovação de orçamentos, novas mensagens).

---

## 5. API e Banco de Dados

A API da aplicação é provida diretamente pelas chamadas aos serviços do **Supabase**. Não existe uma camada tradicional de "backend de rotas REST/GraphQL" gerida manualmente, visto que o frontend se comunica com o banco de dados via \`Supabase Client\` utilizando RLS (políticas de segurança a nível de linha) para garantir a segurança dos dados.

### Entidades do Banco de Dados (Schema Resumido)
Baseado nas diretrizes de migração (\`supabase/migrations/\`):
- \`profiles\`: Detalhes dos usuários (inclui identificadores como CNPJ).
- \`clients\`: Base de dados dos clientes (relaciona dados de pessoa física ou jurídica).
- \`quotes\`: Tabela principal de orçamentos.
- \`quote_customization\`: Preferências visuais e de campos do orçamento.
- \`catalog_folders\` & \`templates\`: Estruturação da biblioteca de serviços.
- \`support_tickets\`: Registro de chamados de atendimento ao cliente.

### Como a Comunicação Acontece
1. **Server Actions (Next.js):** Localizadas em \`src/app/actions/\`, contêm a lógica de negócio segura que roda no servidor. Elas interagem com o banco via \`@supabase/ssr\`.
2. **Componentes Clientes:** Podem escutar mudanças em tempo real ou fazer mutações otimistas se comunicando com Server Actions.

---

## 6. Ambiente de Desenvolvimento (Quick Start)

### Pré-requisitos
- Node.js (v20+)
- Conta no Supabase configurada com o projeto criado
- Chaves de API do Supabase (URL e Anon Key)

### Como rodar o projeto
1. Clone o repositório.
2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`
3. Copie o arquivo de variáveis de ambiente e preencha com as credenciais do seu projeto Supabase:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
4. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Acesse http://localhost:3000.
