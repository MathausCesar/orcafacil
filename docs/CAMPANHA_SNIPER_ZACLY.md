# Campanha sniper Zacly

## Objetivo da primeira rodada

Validar aquisicao paga com pouco dinheiro, focando em usuarios que ja sentem dor de orcamento manual e precisam enviar proposta profissional pelo WhatsApp.

Meta da rodada: gerar os primeiros cadastros qualificados, medir onboarding concluido, criacao de proposta, envio da proposta e tentativa de upgrade.

## Publico inicial

Rodada 1: marceneiros e moveis planejados.

Motivo: o servico costuma ter ticket maior, exige apresentacao visual, prazo, itens detalhados e aprovacoes por WhatsApp. Isso aumenta a chance de o usuario perceber valor no app antes de pagar.

Rodada 2: eletricistas.

Motivo: dor frequente, alto volume, muita decisao pelo celular e necessidade de separar material, mao de obra e prazo.

## Canal recomendado

Comecar por Google Search.

Evitar Display, Performance Max e publico amplo no inicio. Com pouco dinheiro, a prioridade e capturar intencao ativa, nao gerar alcance.

## Orcamento inicial

Plano conservador: R$ 15 a R$ 20 por dia durante 7 dias.

Regra de escala: so aumentar quando houver sinal de qualidade, nao apenas clique barato.

Sinais de qualidade:
- 20% ou mais dos cadastros concluem onboarding.
- 30% ou mais dos onboardings criam uma proposta.
- 40% ou mais das propostas criadas sao compartilhadas.
- Pelo menos uma tentativa de checkout a cada 20 a 30 propostas criadas.

## Campanha 1: marceneiros

Nome sugerido: `ZACLY_BR_Search_Marceneiros_AltaIntencao`

Pagina de destino:

`https://zacly.com.br/c/marceneiros?utm_source=google&utm_medium=cpc&utm_campaign=sniper_marceneiros&utm_content=search_01&utm_term={keyword}`

Grupos de anuncios:

1. App e sistema
- "app para marceneiro"
- "sistema para marcenaria simples"
- "sistema de orcamento para marcenaria"
- "app de orcamento para marcenaria"

2. Proposta e orcamento
- "orcamento profissional marcenaria"
- "modelo de orcamento para marcenaria"
- "proposta comercial marcenaria"
- "orcamento moveis planejados"

Negativas iniciais:
- vaga
- emprego
- salario
- curso
- faculdade
- gratis download
- pdf pronto
- planilha pronta
- projeto gratuito
- como abrir marcenaria

## Oferta do anuncio

Mensagem central:

Crie orcamentos profissionais para marcenaria, envie pelo WhatsApp e acompanhe a aprovacao do cliente.

Promessa de baixo risco:

Comece gratis. O plano pago entra quando o usuario precisar de mais propostas e personalizacao.

## Exemplos de anuncios

Titulo 1: Orcamento para marcenaria

Titulo 2: Envie proposta pelo WhatsApp

Titulo 3: Comece gratis na Zacly

Descricao: Monte propostas profissionais com itens, prazo, PDF e link de aprovacao. Feito para autonomos que hoje controlam tudo no papel.

---

Titulo 1: App simples para marceneiros

Titulo 2: Proposta profissional em minutos

Titulo 3: Cliente aprova no link

Descricao: Organize clientes, servicos e orcamentos sem complicar sua rotina. Teste gratis e use pelo celular.

## Eventos que agora sustentam a campanha

- `marketing_attribution_captured`: origem UTM e clique pago capturados.
- `auth_signup_started`: usuario iniciou cadastro.
- `auth_signup_submitted`: cadastro por e-mail enviado.
- `auth_google_started`: usuario iniciou login/cadastro Google.
- `auth_login_completed`: login concluido.
- `onboarding_completed`: usuario terminou configuracao inicial.
- `quote_created`: proposta criada.
- `quote_updated`: proposta editada.
- `quote_share_opened`: usuario abriu compartilhamento.
- `quote_share_clicked`: usuario copiou link, enviou WhatsApp, e-mail ou PDF.
- `quote_status_changed`: proposta mudou de etapa.
- `quote_limit_reached`: usuario bateu limite do plano gratis.
- `checkout_started`: usuario tentou assinar.
- `checkout_returned_success`: usuario voltou do Stripe com pagamento concluido.
- `checkout_returned_canceled`: usuario abandonou ou cancelou checkout.

## Criterio de decisao apos 7 dias

Manter e otimizar:

Se houver propostas criadas e compartilhadas com custo aceitavel, pausar palavras fracas e concentrar verba nas palavras que chegam ate `quote_share_clicked`.

Trocar nicho:

Se houver clique e cadastro, mas pouca proposta criada, testar eletricistas com a mesma estrutura.

Corrigir produto/oferta:

Se houver proposta criada, mas nenhum envio ou checkout, revisar limite free, mensagem de upgrade, tela de proposta e fluxo de envio por WhatsApp.

## Proxima melhoria recomendada

Criar uma landing page ainda mais direta para campanha paga, com exemplo de proposta de marcenaria acima da dobra e CTA "Criar meu primeiro orcamento gratis". A pagina atual serve para iniciar, mas uma versao paga pode reduzir dispersao e aumentar conversao.
