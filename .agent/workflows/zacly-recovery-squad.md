---
description: Aciona o Zacly Recovery Squad para manutencao, reparo e melhoria do app web Zacly.
---

# Zacly Recovery Squad Workflow

Use este workflow para tarefas complexas no Zacly.

## Pre-flight

1. Confirmar que o diretorio e `F:\Dev\orcafacil_web`.
2. Ler `docs/ZACLY_AGENT_TEAM.md`.
3. Identificar dominio da tarefa.
4. Definir dono de arquivos antes de editar.
5. Verificar `git status --short`.

## Roteamento

| Tipo de tarefa | Agentes |
| --- | --- |
| Supabase inativo, migrations, RLS | `zacly-supabase-architect`, `zacly-security-auditor`, `zacly-qa-release-engineer` |
| Billing, checkout, webhook, cancelamento | `zacly-billing-engineer`, `zacly-security-auditor`, `zacly-qa-release-engineer` |
| UI, proposta, cliente, catalogo, onboarding | `zacly-nextjs-product-engineer`, `zacly-product-growth-strategist`, `zacly-qa-release-engineer` |
| Deploy, env vars, logs, dominio | `zacly-devops-observability-engineer`, `zacly-security-auditor` |
| Feature nova | `zacly-product-growth-strategist`, `zacly-orchestrator`, especialista tecnico, `zacly-qa-release-engineer` |

## Gate de Implementacao

Antes de mexer:

- Escrever escopo em 3-6 bullets.
- Listar arquivos provaveis.
- Confirmar que nenhum outro agente esta editando os mesmos arquivos.

## Gate de Validacao

Executar conforme o escopo:

- `npm run build`
- `npm run lint`
- `npm audit --audit-level=critical`
- Smoke test manual ou Playwright do fluxo alterado
- Logs Vercel quando envolver producao

## Relatorio Final

Sempre responder com:

- O que mudou
- Quem validou ou qual agente revisou
- Comandos/testes executados
- Riscos restantes
- Proximo passo objetivo
