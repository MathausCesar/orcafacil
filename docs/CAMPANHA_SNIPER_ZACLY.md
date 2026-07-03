# Campanha sniper Zacly

## Decisao da primeira rodada

Primeira campanha: mecanicos autonomos e pequenas oficinas.

Recorte certo: oficina pequena que ainda envia preco pelo WhatsApp, audio, papel, caderno ou planilha simples.

Recorte errado: oficina procurando ERP completo, emissao de nota fiscal, compras complexas, integracao com autopecas ou estoque avancado.

## Hipotese central

O cliente da oficina nao compara apenas preco. Ele compara confianca.

Quando o mecanico envia apenas "fica R$ 1.340" no WhatsApp, o cliente tende a pedir desconto ou sumir. Quando recebe uma proposta com pecas, mao de obra, prazo, condicoes e link de aprovacao, o valor fica mais justificavel.

## Objetivo da rodada

Validar aquisicao paga com pouco dinheiro antes de escalar.

Meta: gerar cadastros qualificados que avancem no funil ate criacao e envio de proposta.

Evento principal de qualidade: `quote_share_clicked`.

Evento de compra/intencao: `checkout_started`.

## Pagina de destino

URL base:

`https://zacly.com.br/c/mecanicos`

URL para Google Ads:

`https://zacly.com.br/c/mecanicos?utm_source=google&utm_medium=cpc&utm_campaign=sniper_mecanicos&utm_content=search_01&utm_term={keyword}`

Observacao: os botoes da landing preservam UTMs e click IDs ao enviar o usuario para `app.zacly.com.br/register`.

## Orcamento inicial

Conservador:

- R$ 15 a R$ 20 por dia.
- 7 dias corridos.
- Rede de Pesquisa do Google.
- Sem Display, Performance Max ou publico amplo no inicio.

Regra: nao escalar por clique barato. Escalar somente se houver avanco no funil.

## Estrutura da campanha

Nome:

`ZACLY_BR_Search_Mecanicos_AltaIntencao`

Tipo:

Google Search.

Lance inicial:

Maximizar cliques com limite de CPC, se a conta ainda nao tiver conversoes suficientes.

Quando houver volume:

Migrar para maximizar conversoes usando eventos importados ou meta equivalente.

## Grupos de anuncios

### Grupo 1: Orcamento para oficina

Intencao: usuario ja quer melhorar como passa orcamento.

Palavras em frase/exata:

- "orcamento oficina mecanica"
- "orcamento para oficina mecanica"
- "orcamento oficina mecanica pelo whatsapp"
- "modelo de orcamento oficina mecanica"
- "orcamento para cliente oficina mecanica"
- "gerador de orcamento para oficina"

Anuncio:

Titulo 1: Orcamento para oficina mecanica

Titulo 2: Envie pelo WhatsApp

Titulo 3: Cliente aprova no link

Descricao: Crie proposta com pecas, mao de obra, prazo e total. Pare de mandar preco solto no WhatsApp. Comece gratis.

### Grupo 2: App simples para mecanico

Intencao: usuario busca ferramenta, mas nao necessariamente ERP.

Palavras em frase/exata:

- "app para mecanico autonomo"
- "app para oficina mecanica"
- "sistema simples para oficina mecanica"
- "app de orcamento para oficina"
- "app para ordem de servico oficina simples"

Anuncio:

Titulo 1: App simples para mecanico

Titulo 2: Orcamento profissional rapido

Titulo 3: Sem ERP complicado

Descricao: Monte orcamentos com servicos, pecas e aprovacao do cliente. Feito para oficina pequena usar pelo celular.

### Grupo 3: Ordem de servico simples

Intencao: usuario quer organizacao, mas pode esperar sistema mais completo. Monitorar com cuidado.

Palavras em frase/exata:

- "ordem de servico oficina mecanica simples"
- "modelo ordem de servico oficina mecanica"
- "ordem de servico para mecanico autonomo"
- "controle de orcamentos oficina mecanica"

Anuncio:

Titulo 1: Ordem de servico simples

Titulo 2: Orcamento com aprovacao

Titulo 3: Para oficina pequena

Descricao: Organize proposta, itens, status e aprovacao do cliente. Ideal para sair do papel e do WhatsApp solto.

## Palavras negativas iniciais

- nota fiscal
- emissor nfe
- emitir nota
- erp completo
- financeiro completo
- sistema gratis download
- baixar gratis
- planilha gratis
- excel
- curso
- vaga
- emprego
- salario
- manual de reparo
- diagrama eletrico
- tabela fipe
- pecas usadas
- autopecas atacado
- fornecedor
- catalogo tecdoc

## Mensagem da landing

Headline:

Orcamento profissional para oficina mecanica, sem virar ERP.

Subheadline:

Pare de mandar preco solto no WhatsApp. Crie uma proposta com pecas, mao de obra, prazo, total e link de aprovacao para o cliente fechar com mais confianca.

CTA:

Criar meu primeiro orcamento gratis.

Filtro de expectativa:

Nao e ERP completo. Nao e nota fiscal. E uma forma simples de vender melhor o servico da oficina.

## Funil no PostHog

Funil minimo:

1. `marketing_attribution_captured`
2. `quote_created`
3. `quote_share_clicked`
4. `checkout_started`

Eventos auxiliares:

- `quote_share_opened`
- `quote_status_changed`
- `quote_limit_reached`
- `checkout_returned_success`
- `checkout_returned_canceled`

## Leitura dos resultados

### Sinais bons

- Usuario cria proposta no mesmo dia do clique.
- Proposta tem item de servico e/ou produto.
- Usuario compartilha link ou WhatsApp.
- Usuario bate limite free ou abre checkout.

### Sinais ruins

- Muito clique e quase nenhum cadastro: copy ou pagina desalinhada.
- Cadastro sem proposta: onboarding ou primeira proposta com atrito.
- Proposta sem compartilhamento: proposta nao parece pronta para cliente.
- Muitos cliques de "sistema para oficina" sem uso: palavra esta trazendo publico de ERP.

## Criterio apos 7 dias

Manter:

Se `quote_share_clicked` aparecer com custo aceitavel e houver pelo menos alguns `checkout_started`.

Otimizar:

Se houver `quote_created`, mas pouco `quote_share_clicked`, melhorar fluxo de envio e CTA dentro da proposta.

Pausar grupo:

Se palavras de "sistema" trouxerem gente procurando ERP completo.

Segunda bala:

Marcenaria / moveis sob medida. Dor de orcamento e apresentacao e muito forte, mas a frequencia tende a ser menor que mecanica.
