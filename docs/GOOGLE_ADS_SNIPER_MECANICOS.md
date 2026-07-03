# Google Ads - Campanha sniper mecanicos

## Configuracao base

Nome da campanha:

`ZACLY_BR_Search_Mecanicos_AltaIntencao`

Objetivo:

Trafego qualificado para landing de mecanicos, medido pelo funil no PostHog.

Tipo:

Rede de Pesquisa.

Status inicial:

Pausada ate revisao final.

Orcamento inicial:

R$ 10,00 por dia por 7 dias.

Escalar para R$ 20,00 por dia apenas se houver sinal de cadastro, criacao de proposta ou checkout iniciado.

Lances:

Maximizar cliques com limite de CPC, se a conta permitir.

Limite de CPC inicial sugerido:

R$ 2,50.

Redes:

- Rede de Pesquisa do Google: ligada.
- Parceiros de pesquisa: desligado na primeira rodada.
- Rede de Display: desligado.

Local:

Brasil.

Idioma:

Portugues.

URL final:

`https://zacly.com.br/c/mecanicos`

Modelo de UTM:

`?utm_source=google&utm_medium=cpc&utm_campaign=sniper_mecanicos&utm_content={adgroupid}_{creative}&utm_term={keyword}`

URL final completa sugerida nos anuncios:

`https://zacly.com.br/c/mecanicos?utm_source=google&utm_medium=cpc&utm_campaign=sniper_mecanicos&utm_content=search_01&utm_term={keyword}`

## Grupo 1 - Orcamento oficina

Nome:

`Orcamento oficina mecanica`

Palavras-chave:

```text
"orcamento oficina mecanica"
[orcamento oficina mecanica]
"orcamento para oficina mecanica"
[orcamento para oficina mecanica]
"orcamento oficina mecanica pelo whatsapp"
[orcamento oficina mecanica pelo whatsapp]
"modelo de orcamento oficina mecanica"
[modelo de orcamento oficina mecanica]
"orcamento para cliente oficina mecanica"
"gerador de orcamento para oficina"
```

## Grupo 2 - App mecanico

Nome:

`App mecanico autonomo`

Palavras-chave:

```text
"app para mecanico autonomo"
[app para mecanico autonomo]
"app para oficina mecanica"
[app para oficina mecanica]
"sistema simples para oficina mecanica"
[sistema simples para oficina mecanica]
"app de orcamento para oficina"
[app de orcamento para oficina]
"app para ordem de servico oficina simples"
```

## Grupo 3 - OS simples

Nome:

`Ordem de servico simples`

Palavras-chave:

```text
"ordem de servico oficina mecanica simples"
[ordem de servico oficina mecanica simples]
"modelo ordem de servico oficina mecanica"
"ordem de servico para mecanico autonomo"
"controle de orcamentos oficina mecanica"
```

## Negativas da campanha

```text
nota fiscal
emissor nfe
emitir nota
nfe
nfse
erp completo
financeiro completo
compras
fornecedor
autopecas atacado
pecas usadas
manual de reparo
diagrama eletrico
tabela fipe
catalogo tecdoc
sistema gratis download
baixar gratis
planilha gratis
excel
curso
vaga
emprego
salario
```

## Anuncio responsivo - base

Headlines com ate 30 caracteres:

```text
Orcamento para oficina
Oficina no WhatsApp
Cliente aprova no link
App simples para mecanico
Sem ERP complicado
Pecas e mao de obra
Proposta profissional
Crie orcamento gratis
Pare de mandar preco solto
Orcamento em minutos
Para mecanico autonomo
Mais confianca no valor
Envie proposta ao cliente
Controle orcamentos
Zacly para oficinas
```

Descricoes com ate 90 caracteres:

```text
Crie proposta com pecas, mao de obra, prazo e total. Envie pelo WhatsApp.
Pare de mandar preco solto. Cliente aprova pelo link sem criar conta.
Feito para oficina pequena sair do papel sem contratar ERP completo.
Comece gratis e teste com um orcamento real da sua oficina.
```

Caminhos:

```text
oficina
orcamento
```

## Sitelinks

### Criar orcamento gratis

URL:

`https://zacly.com.br/c/mecanicos?utm_source=google&utm_medium=cpc&utm_campaign=sniper_mecanicos&utm_content=sitelink_criar&utm_term={keyword}`

Descricao:

Comece pelo primeiro teste.

Sem cartao no cadastro.

### Como funciona

URL:

`https://zacly.com.br/c/mecanicos?utm_source=google&utm_medium=cpc&utm_campaign=sniper_mecanicos&utm_content=sitelink_como_funciona&utm_term={keyword}#como-funciona`

Descricao:

Proposta, WhatsApp e aprovacao.

Fluxo simples para oficina.

### Planos

URL:

`https://zacly.com.br/precos?utm_source=google&utm_medium=cpc&utm_campaign=sniper_mecanicos&utm_content=sitelink_planos&utm_term={keyword}`

Descricao:

Comece gratis.

Upgrade quando precisar.

## Frases de destaque

```text
Sem cartao no cadastro
Cliente aprova no link
Feito para oficina pequena
Use pelo celular
Sem ERP complicado
```

## Snippets estruturados

Cabecalho:

Servicos

Valores:

```text
Orcamentos
WhatsApp
Aprovacao
Pecas e servicos
Pipeline simples
```

## Checagem antes de ativar

- Campanha pausada.
- Rede de Display desligada.
- Parceiros de pesquisa desligados.
- Palavras amplas evitadas.
- Negativas aplicadas.
- URL com `utm_campaign=sniper_mecanicos`.
- Orcamento diario em R$ 10,00 na primeira semana.
- Funil no PostHog aberto para acompanhar.

## Criterio de pausa rapida

Pausar ou revisar em ate 72 horas se houver:

- Cliques sem `marketing_attribution_captured`.
- Cadastros sem `quote_created`.
- Muitos termos de busca ligados a ERP, nota fiscal, curso, vaga ou peca.
- CPC acima do limite sem avance no funil.
