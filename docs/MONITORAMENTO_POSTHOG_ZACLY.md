# Monitoramento PostHog Zacly

Objetivo: acompanhar cada cadastro novo vindo de campanha sem depender de achismo.

## Como validar um usuario novo

Abra o PostHog em Activity ou Persons e procure a pessoa mais recente. A linha do tempo ideal e:

1. `marketing_attribution_captured`
2. `$pageview` em `/c/mecanicos` ou outra pagina de campanha
3. `auth_signup_started` ou `auth_google_started`
4. `auth_signup_submitted` ou `auth_login_completed`
5. `app_user_identified`
6. `onboarding_completed`
7. `client_created`
8. `quote_created`
9. `quote_share_opened`
10. `quote_share_clicked`
11. `checkout_started`, quando houver intencao de assinatura

## Como interpretar travas

- Tem `marketing_attribution_captured`, mas nao tem cadastro: a pagina/anuncio nao convenceu ou o usuario nao entendeu a proposta.
- Tem cadastro, mas nao tem `onboarding_completed`: o onboarding esta longo, confuso ou deu erro.
- Tem `onboarding_completed`, mas nao tem `client_created`: o primeiro passo apos entrar no app nao ficou claro.
- Tem `client_created`, mas nao tem `quote_created`: o formulario de proposta esta gerando atrito.
- Tem `quote_created`, mas nao tem `quote_share_clicked`: o usuario nao percebeu como enviar ou o WhatsApp/link nao ficou claro.
- Tem `checkout_started`, mas nao converteu: revisar preco, checkout Stripe, limite do plano free e mensagem de upgrade.

## Eventos de erro para olhar primeiro

- `$exception`
- `app_error_captured`
- `auth_flow_error`
- `client_create_failed`
- `quote_create_failed`
- `quote_update_failed`
- `quote_client_decision_failed`
- `checkout_start_failed`

## Gravacoes de sessao

Para ver o comportamento visual do usuario, habilite no PostHog:

Project Settings > Session replay > Record user sessions.

O app ja solicita gravacao de sessao para trafego pago, mantendo mascaramento de campos sensiveis. Se a conta do PostHog estiver com Session Replay desligado, os eventos continuam funcionando, mas a gravacao visual nao aparece.

## Publicos para remarketing

Use estes segmentos como base:

- Visitou `/c/mecanicos` e nao cadastrou.
- Cadastrou e nao concluiu onboarding.
- Concluiu onboarding e nao cadastrou cliente.
- Cadastrou cliente e nao criou proposta.
- Criou proposta e nao compartilhou.
- Visitou precos e nao assinou.

Para Google Ads, use listas de remarketing do Google Ads/Google Tag. Para listas por e-mail, use apenas usuarios que aceitaram comunicacao e politicas de privacidade.

## Checagem diaria da campanha

1. Ver quantos usuarios chegaram por `utm_campaign=sniper_mecanicos`.
2. Abrir os usuarios que tiveram `app_user_identified`.
3. Confirmar se ha gravacao de sessao.
4. Ver se chegaram ate `quote_created`.
5. Anotar o primeiro ponto de abandono.
6. Ver se houve evento de erro na mesma sessao.

