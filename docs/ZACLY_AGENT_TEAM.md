# Zacly Agent Team

Este documento define o time de agentes especialistas para retomar, manter,
reparar e evoluir o Zacly.

Base alvo: `F:\Dev\orcafacil_web`

Aplicacao alvo: Next.js 16, React 19, Supabase, Stripe, Vercel, Tailwind,
shadcn/Radix, Resend e PostHog.

## Principios

- Sempre trabalhar primeiro na base web `orcafacil_web`; a pasta `OrcaFacil`
  e um prototipo Android antigo.
- Supabase e billing sao caminho critico de retomada. Nenhuma feature nova deve
  ir para producao antes de validar login, workspace, assinatura e proposta.
- Build verde nao basta. O gate minimo e: build, fluxo manual principal,
  seguranca de credenciais, webhook Stripe e smoke test no Vercel.
- Agentes devem ter donos claros de arquivos para reduzir conflito.
- Nenhum agente deve reverter mudancas de outro sem confirmacao.

## Time Principal

| Agente | Arquivo | Missao |
| --- | --- | --- |
| Zacly Orchestrator | `.agent/agents/zacly-orchestrator.md` | Coordenar prioridades, quebrar tarefas e integrar entregas. |
| Supabase Architect | `.agent/agents/zacly-supabase-architect.md` | Restaurar banco, migrations, RLS, auth e workspaces. |
| Billing Engineer | `.agent/agents/zacly-billing-engineer.md` | Manter Stripe, checkout, webhooks, planos e cancelamento real. |
| Next.js Product Engineer | `.agent/agents/zacly-nextjs-product-engineer.md` | Evoluir app, componentes, rotas e experiencia do usuario. |
| Security Auditor | `.agent/agents/zacly-security-auditor.md` | Revisar segredos, RLS, auth, LGPD, headers e vulnerabilidades. |
| QA Release Engineer | `.agent/agents/zacly-qa-release-engineer.md` | Criar smoke tests, regressao, Playwright e gates de release. |
| DevOps Observability Engineer | `.agent/agents/zacly-devops-observability-engineer.md` | Vercel, env vars, logs, deploys, uptime e alertas. |
| Product Growth Strategist | `.agent/agents/zacly-product-growth-strategist.md` | Refinar proposta de valor, onboarding, pricing e funil. |
| Improvement Analyst | `.agent/agents/zacly-improvement-analyst.md` | Identificar melhorias praticas por publico alvo, fluxo, tecnologia, impacto e esforco. |

## Skills Recomendadas

Use estas skills/ferramentas quando aplicavel:

- `vercel:nextjs`
- `vercel:shadcn`
- `vercel:auth`
- `vercel:payments`
- `vercel:env-vars`
- `vercel:deployments-cicd`
- `vercel:observability`
- `vercel:verification`
- `vercel:agent-browser`
- `vercel:react-best-practices`
- `vercel:vercel-api`
- `.agent/skills/systematic-debugging`
- `.agent/skills/webapp-testing`
- `.agent/skills/api-patterns`
- `.agent/skills/architecture`
- `.agent/skills/seo-fundamentals`

## Ordem de Acionamento

### Retomada do projeto

1. Zacly Orchestrator
2. Supabase Architect
3. Security Auditor
4. Billing Engineer
5. QA Release Engineer
6. DevOps Observability Engineer
7. Product Growth Strategist
8. Next.js Product Engineer

### Bug de producao

1. QA Release Engineer para reproduzir.
2. Supabase Architect ou Billing Engineer se o erro tocar dados/pagamento.
3. Next.js Product Engineer se for UI/fluxo.
4. Security Auditor se tocar auth, RLS, segredo ou permissao.
5. DevOps Observability Engineer para logs/deploy.

### Feature nova

1. Product Growth Strategist define objetivo, publico e metrica.
2. Improvement Analyst valida dor real, escopo minimo e risco de complexidade.
3. Zacly Orchestrator quebra o escopo.
4. Supabase Architect define impacto de dados.
5. Next.js Product Engineer implementa.
6. QA Release Engineer valida.
7. Security Auditor revisa riscos.
8. DevOps Observability Engineer acompanha deploy.

## Gates de Qualidade

Antes de publicar:

- `npm run build`
- `npm run lint` ou lista explicita de excecoes conhecidas
- `npm audit` revisado, com criticos tratados ou justificados
- Smoke test: login, onboarding, cliente, servico/produto, proposta, PDF/link
  de aprovacao
- Checkout mensal e anual validado em ambiente de teste Stripe
- Webhook Stripe validado com assinatura real
- Cancelamento validado no Stripe e refletido no Supabase
- Nenhum segredo ou credencial em logs, docs ou testes

## Backlog Inicial de Retomada

1. Reativar ou recriar o projeto Supabase.
2. Rodar migrations e validar RLS/workspaces.
3. Rotacionar credenciais vazadas em logs/testes antigos.
4. Corrigir cancelamento de assinatura para chamar Stripe de verdade.
5. Remover logs com credenciais e limpar artefatos de teste inseguros.
6. Atualizar dependencias criticas.
7. Montar smoke tests Playwright para o fluxo principal.
8. Revisar pricing, landing pages e onboarding para autonomos.
