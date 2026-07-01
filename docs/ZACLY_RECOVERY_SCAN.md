# Zacly Recovery Scan

Data: 2026-06-26

Base analisada: `F:\Dev\orcafacil_web`

## Status Executivo

O Zacly web esta recuperado localmente e o deploy Vercel segue ativo em
`https://app.zacly.com.br`.

O projeto correto e o repositorio GitHub `MathausCesar/orcafacil`, nao o
prototipo Android em `F:\Dev\OrcaFacil`.

O build de producao passa com Next 16.2.9 e React 19.2.7. O Supabase voltou a
responder e as migrations de billing e seguranca ja foram aplicadas. Em
2026-06-26 foi publicada uma nova versao de producao na Vercel com as correcoes
de seguranca, billing, admin, equipe e link publico de proposta com token.

O estado atual e: app recuperado, compilando e publicado. Login Google foi
validado pelo usuario, billing foi tecnicamente reparado, regras criticas de
seguranca foram aplicadas no Supabase e a Vercel esta apontando
`https://app.zacly.com.br` para a nova versao.

## Atualizacao de 2026-07-01 - Onboarding por oficio

Corrigido:

- O onboarding deixou de montar catalogo inicial lendo diretamente os templates
  amplos do banco por categoria.
- Agora o catalogo inicial e gerado por kits curados por oficio/especialidade,
  evitando itens duplicados ou incoerentes para autonomos.
- Foram adicionadas opcoes de `Marceneiro / Moveis Planejados` e
  `Encanador / Hidraulica` no ramo de construcao e reformas.
- A deduplicacao passou a normalizar nomes sem acento, pontuacao e palavras de
  ligacao antes de comparar com itens ja existentes.
- Os itens criados pelo onboarding agora carregam unidade e categoria, alem de
  separar corretamente servico e produto.

Validado:

- `npm run lint`: passou.
- `npm run build`: passou.
- Smoke real com usuario temporario: onboarding em `Construcao & Reformas` +
  `Marceneiro / Moveis Planejados` criou 9 itens coerentes de marcenaria, sem
  duplicados e sem itens de outras areas.

## Atualizacao de 2026-07-01 - Rodada 5 Qualidade estrutural

Corrigido:

- `OrganizationProvider` deixou de rodar no layout raiz e agora fica restrito
  a area logada do app, onde `WorkspaceSwitcher`, dashboard e busca de produtos
  realmente usam o contexto de organizacao.
- Viewport mobile deixou de bloquear zoom do usuario. O app manteve
  `width=device-width, initial-scale=1` e removeu o bloqueio de escala.
- Proxy passou a ignorar todos os caminhos internos `_next`, evitando
  interferencia em assets do framework, otimizacao de imagem e HMR local.
- Logos da tela de login com `fill` agora informam `sizes`, removendo warnings
  de performance do Next.

Validado:

- `npm run lint`: passou.
- `npm audit --audit-level=critical`: 0 vulnerabilidades.
- `npm run build`: passou.
- Smoke local em modo producao: login por email/senha com usuario temporario,
  abertura do painel, contexto de organizacao sem erro e sem overflow
  horizontal.
- Smoke mobile em modo producao: login e perfil em 390px sem overflow
  horizontal.
- Smoke local em desenvolvimento via `localhost`: tela de login hidrata,
  alterna para cadastro e fica sem warnings/erros de console relevantes.

## Atualizacao de 2026-07-01 - Rodada 4 Billing

Corrigido:

- Checkout Stripe agora valida se o Price ID configurado esta ativo, recorrente
  e no intervalo esperado antes de abrir o pagamento.
- Checkout bloqueia criacao de assinatura duplicada quando o usuario ja tem uma
  assinatura billable no perfil ou no cliente Stripe.
- Checkout passa metadata tambem para `subscription_data`, melhorando a
  rastreabilidade dos eventos de assinatura.
- Retorno de pagamento aprovado passa a levar o usuario para `/profile` com o
  estado da conta.
- Webhook Stripe passou a usar o cliente admin centralizado do Supabase e valida
  explicitamente assinatura/segredo antes de processar eventos.
- Webhook sincroniza assinatura completa em `checkout.session.completed`,
  `invoice.payment_succeeded`, `invoice.payment_failed`,
  `customer.subscription.updated` e `customer.subscription.deleted`.
- Cancelamento grava campos sensiveis de billing via service role, compatível
  com o hardening de permissao aplicado em `profiles`.
- Interface de conta agora mostra plano, status, vencimento e cancelamento
  agendado sem dizer que o Pro foi removido imediatamente.

Validado:

- Variaveis locais essenciais existem sem expor valores.
- Stripe retornou os dois precos configurados como ativos, recorrentes e em BRL:
  mensal com intervalo mensal e anual com intervalo anual.
- Supabase confirmou `profiles` com campos de billing e
  `cancellation_feedback` existente.
- `npm run lint`: passou.
- `npm run build`: passou.
- Webhook local validado com eventos assinados e usuario temporario no Supabase:
  `checkout.session.completed`, `customer.subscription.updated` e
  `customer.subscription.deleted`.

Observacao: as chaves Stripe atuais sao de modo live. A rodada validou o
webhook com assinatura real e payloads controlados, sem criar cobranca. O teste
de pagamento completo deve ser feito com ambiente Stripe test separado ou com
uma compra real controlada.

## Atualizacao de 2026-06-26

Corrigido localmente:

- Upgrade de seguranca: `next@16.2.9`, `react@19.2.7`, `react-dom@19.2.7`,
  `posthog-js@1.393.0` e `resend@6.14.0`.
- `npm audit` caiu para 28 vulnerabilidades e 0 criticas.
- Build e TypeScript passam: `npx tsc --noEmit` e `npm run build`.
- Admin agora valida superadmin dentro das server actions antes de usar service
  role.
- Resposta de ticket admin busca o email real da conta no Supabase Auth, nao
  mais parametros enviados pelo navegador.
- Convite/edicao de equipe agora exige dono/admin e nao permite promover alguem
  a `owner` via cliente.
- Upload de logo bloqueia SVG e restringe tipos a PNG/JPG/WebP.
- Cadastro deixou de chamar `check_email_exists`, removendo enumeracao de email.
- Votos de sugestoes nao dependem mais de RPCs client-callable; a contagem foi
  movida para trigger SQL.
- Status de proposta foi alinhado com a UI:
  `draft`, `pending`, `sent`, `approved`, `rejected`, `in_progress`,
  `completed`.
- Link publico de proposta passou a exigir `public_token` por orcamento para
  visualizacao/aprovacao por cliente externo.
- A pagina de proposta passou a usar `expiration_date` em vez de `valid_until`.
- Paginas admin foram marcadas como dinamicas para evitar erro de cookies no
  build.

Validado apos aplicar migration e deploy:

- Migration `20260626000000_harden_access_controls.sql` aplicada via CLI.
- REST Supabase confirmou `quotes.public_token`: `200`.
- REST Supabase anonimo em `profiles` voltou `[]`, sem vazamento publico.
- RPC anonima `check_email_exists` voltou `401`.
- Deploy Vercel de producao publicado e alias atualizado:
  `https://app.zacly.com.br`.
- Smoke test de producao:
  - `/login`: `200`.
  - `/quotes/{id}?token={public_token}`: `200`.
  - `/`: `307` para `/login`.

Ainda pendente:

- Regenerar `database.types.ts` a partir do schema real.
- Rodar teste manual autenticado completo:
  login -> criar proposta -> compartilhar link -> aprovar como cliente externo
  -> confirmar status.
- Testar checkout Stripe mensal/anual e webhook com evento real/teste.

Observacao: `npm run lint` geral ainda falha por divida antiga do projeto. A
maior parte esta em `any`, imports sem uso, textos JSX nao escapados e regras
React em componentes antigos.

## Validacoes Recentes

- `https://app.zacly.com.br/app/login` responde `200 OK`.
- Vercel nao mostrou erros de producao nas ultimas 2 horas.
- `vercel env pull --environment=production` baixou variaveis de producao.
- As variaveis de producao apontam para `https://bxaxxeapmriqsnonerdk.supabase.co`.
- Apos reativacao pelo usuario, o DNS publico voltou a resolver esse host.
- `/auth/v1/settings` responde erro esperado sem API key, confirmando que o
  endpoint Supabase esta online.
- Consulta REST com service role confirmou que `cancellation_feedback` existe.
- Consulta REST confirmou que `profiles.stripe_subscription_id` ainda nao
  existe no banco de producao.

Conclusao: a pagina de login carrega e o Supabase esta online, mas o schema de
billing precisa receber a migration local antes de considerar o fluxo de
assinatura totalmente recuperado.

## Correcoes Aplicadas em 2026-06-23

- Stripe e Resend agora usam inicializacao lazy, evitando erro em build ou
  paginas que nao usam esses servicos.
- Checkout Stripe removeu `any` e usa payload tipado.
- Webhook Stripe agora persiste subscription id, price id, status, periodo atual
  e cancelamento no fim do periodo quando o schema estiver atualizado.
- Webhook cobre `customer.subscription.updated` e
  `customer.subscription.deleted`.
- Cancelamento agora chama Stripe para marcar `cancel_at_period_end`, em vez de
  apenas baixar o plano localmente.
- Webhook e cancelamento possuem fallback temporario para o schema antigo,
  mantendo ativacao/cancelamento basicos enquanto a migration nao for aplicada.
- `src/middleware.ts` foi migrado para `src/proxy.ts`, removendo o aviso do
  Next 16.
- Adicionada migration local
  `supabase/migrations/20260623000000_harden_billing_subscriptions.sql`.
- Corrigida `NEXT_PUBLIC_APP_URL` na Vercel de
  `http://app.zacly.com.br` para `https://app.zacly.com.br`.
- Criado helper centralizado para URL do app, usado em auth, checkout Stripe e
  links publicos de proposta.
- Deploy de producao realizado:
  `dpl_Gwta2Db7dL7dt12bA9pKdr7V7Jpa`.
- Pos-deploy: `https://app.zacly.com.br/login` responde 200 e callback invalido
  redireciona para `https://app.zacly.com.br/login?message=auth_code_error`.
- CLI Supabase conectada ao projeto Zacly `bxaxxeapmriqsnonerdk`.
- Migration de billing aplicada no banco de producao via
  `supabase db query --linked --file`.
- Pos-migration: API REST confirmou que `profiles` agora expoe
  `stripe_subscription_id`, `stripe_price_id`, `current_period_end` e
  `cancel_at_period_end`.
- Configuracao de Supabase Auth corrigida via Management API:
  `site_url = https://app.zacly.com.br` e redirect allowlist com
  `https://app.zacly.com.br/app/auth/callback`.
- OAuth Google validado ate a primeira etapa: Supabase gera URL do Google com
  `redirect_to=https://app.zacly.com.br/app/auth/callback`.
- Acesso administrativo provavel identificado:
  `mathauscesar@gmail.com`, provider `email google`, `is_superadmin=true`.

Validado:

- `npx tsc --noEmit`: passou.
- `npm run build`: passou.
- Lint dos arquivos alterados: passou.
- `npm run lint` geral ainda falha por divida antiga fora desta rodada:
  156 problemas, sendo 86 erros e 70 avisos.

## Achados por Especialista

### Supabase/Postgres

Responsavel por schema, migrations, RLS, auth e workspaces.

Achados:

- Core critico: `profiles`, `clients`, `quotes`, `quote_items`, `services`,
  `item_folders`, `organizations`, `organization_members`.
- Suporte/produto: `support_tickets`, `feature_suggestions`,
  `suggestion_votes`, `notifications`, `cancellation_feedback`.
- RPCs esperadas: `check_email_exists`, `approve_quote_public`,
  `update_quote_status`, `increment_votes`, `decrement_votes`.
- Ha risco de migrations ausentes ou invalidas para algumas tabelas/funcoes
  chamadas pelo codigo.
- Migration de workspaces e sensivel: migra dados, deleta orfaos e torna
  `organization_id` obrigatorio.
- Possivel mismatch de status de `quotes`: migrations antigas limitam valores
  que o codigo atual parece expandir.

Proximas acoes:

1. Comparar schema real do Supabase com actions e migrations locais.
2. Corrigir staging antes de producao.
3. Validar RLS de workspaces e `quote_items`.
4. Confirmar bucket `logos` e redirects de auth.
5. Regenerar `database.types.ts` depois do schema final.

### Stripe/Billing

Responsavel por checkout, webhooks, planos mensal/anual e cancelamento.

Achados:

- Checkout mensal/anual existe em `/api/checkout`.
- Webhook Stripe existe em `/api/webhook`.
- Webhook atualiza `profiles.plan`, `stripe_customer_id` e
  `subscription_status`.
- Cancelamento atual salva feedback e baixa plano localmente, mas nao cancela a
  assinatura no Stripe.
- Schema de producao ainda nao possui `stripe_subscription_id`,
  `stripe_price_id`, `current_period_end` ou `cancel_at_period_end`.
- Regras de acesso usam `plan`, mas deveriam considerar tambem
  `subscription_status` e periodo vigente.

Proximas acoes:

1. Aplicar a migration de billing no Supabase Zacly.
2. Definir billing por usuario ou organizacao.
3. Testar checkout mensal/anual com Stripe em modo teste.
4. Testar cancelamento com `cancel_at_period_end`.
5. Testar webhooks com Stripe CLI/Test Clocks.

### Next.js/Frontend

Responsavel por rotas, UX, componentes, acessibilidade e manutencao React.

Achados:

- Rotas criticas: auth, dashboard, clients, profile, pricing, quotes,
  onboarding, admin e marketing.
- Lint historicamente falha com muitos erros: `any`, unused vars, JSX nao
  escapado e regras React.
- Pagina `quotes/[id]` esta grande e cria componente durante render.
- Stripe/Resend eram inicializados em escopo global; isso foi corrigido com
  getters lazy.
- `OrganizationProvider` roda no layout raiz, afetando marketing/auth.
- Mobile bloqueia zoom via viewport.

Proximas acoes:

1. Corrigir lint por categoria.
2. Refatorar pagina de detalhe de proposta.
3. Mover Stripe/Resend para getters lazy.
4. Levar OrganizationProvider para area logada.
5. Fazer passe de acessibilidade.

### QA/DevOps

Responsavel por gates, deploy, auditoria e smoke tests.

Achados:

- Build passa em logs anteriores.
- Next 16 alertava que `middleware` estava depreciado; migrado para `proxy`.
- `npm run lint` falhou com 156 problemas em execucao atual.
- `npm audit` indicou 41 vulnerabilidades, incluindo 1 critica.
- TestSprite e antigo, com credenciais em texto claro e 18 falhas historicas em
  30 testes.
- Nao ha script de teste no `package.json`.

Proximas acoes:

1. Atualizar dependencias criticas.
2. Limpar segredos dos artefatos TestSprite e rotacionar credenciais.
3. Criar smoke tests Playwright sem credenciais reais.
4. Manter gate de build e lint por arquivos alterados.
5. Criar checklist de release preview/producao.

### Produto/Growth

Responsavel por posicionamento, funil, pricing e ativacao.

Achados:

- Proposta de valor: transformar orcamentos improvisados em propostas
  profissionais com logo, WhatsApp, link de aprovacao e acompanhamento.
- Promessa esta inconsistente: 30 segundos, 1 minuto, plano gratis e 7 dias
  gratis aparecem em lugares diferentes.
- Copy da landing de mecanicos e forte; pode converter esse nicho, mas nao serve
  igualmente para eletricistas/marceneiros.
- Provas sociais e numeros precisam ser verificaveis ou suavizados.

Proximas acoes:

1. Unificar promessa central.
2. Escolher uma oferta comercial unica.
3. Criar landing pages por vertical.
4. Acelerar primeira proposta no onboarding.
5. Substituir prova social generica por demonstracoes reais.

## Prioridade Recomendada

### Fase 1: Reconexao Real e Seguranca

1. Confirmar URL/chaves do Supabase ativo em Vercel e local.
2. Rotacionar chaves expostas em logs/testes antigos.
3. Validar schema real e RLS.
4. Confirmar login, profile e workspace.

### Fase 2: Billing Confiavel

1. Adicionar campos de assinatura.
2. Corrigir cancelamento Stripe.
3. Revalidar checkout mensal/anual e webhook.

### Fase 3: Fluxo Principal

1. Criar cliente.
2. Criar servico/produto.
3. Criar proposta.
4. Abrir link de aprovacao.
5. Confirmar status e notificacoes.

### Fase 4: Qualidade e Release

1. Dependencias criticas.
2. Lint por blocos.
3. Smoke tests.
4. Deploy preview.
5. Release controlado.
