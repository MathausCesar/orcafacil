-- Atualiza as descrições da tabela template_services para registros existentes

-- Automotivo
UPDATE public.template_services SET description = 'Substituição completa do óleo do motor e filtro de óleo, utilizando componentes originais ou de alta performance. Custo do óleo cobrado à parte.' WHERE name = 'Troca de Óleo e Filtro' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Ajuste computadorizado da geometria de direção para garantir desgaste uniforme dos pneus e melhor controle direcional.' WHERE name = 'Alinhamento e Balanceamento' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Substituição do conjunto de pastilhas de freio dianteiras. Inclui sangria e verificação do nível de fluido de freio DOT4.' WHERE name = 'Troca de Pastilhas de Freio' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Leitura e rastreamento de falhas eletrônicas na central do veículo utilizando scanner automotivo profissional (OBD2).' WHERE name = 'Diagnóstico Eletrônico' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Desobstrução e equalização dos bicos injetores utilizando máquina ultrassônica, melhorando consumo e desempenho.' WHERE name = 'Limpeza de Bicos Injetores' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Serviço de mão de obra para descida do câmbio e substituição completa do kit de embreagem (platô, disco e rolamento).' WHERE name = 'Troca de Embreagem Completa' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Recarga e verificação de estanqueidade do gás refrigerante no sistema de ar condicionado veicular.' WHERE name = 'Carga de Gás do Ar Condicionado' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Adaptação e cabeamento profissional para instalação de centrais multimídia, módulos amplificadores ou alto-falantes.' WHERE name = 'Instalação de Som Automotivo' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Polimento técnico da carroceria para correção de micro-riscos, nivelamento do verniz e recuperação de brilho profundo.' WHERE name = 'Polimento Automotivo' AND category_id = 'auto';
UPDATE public.template_services SET description = 'Limpeza detalhada interior e exterior, englobando aspiração pesada, pretinho, lavagem de caixa de rodas e aplicação de cera protetora.' WHERE name = 'Lavagem Completa + Enceramento' AND category_id = 'auto';

-- Construção
UPDATE public.template_services SET description = 'Preparo e aplicação de piso cerâmico ou porcelanato sobre contrapiso utilizando argamassa específica. Valor cobrado por metro quadrado.' WHERE name = 'Assentamento de Piso Cerâmico' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Aplicação de argamassa e nivelamento a prumo para acabamento liso em blocos cerâmicos ou de concreto.' WHERE name = 'Reboco de Parede' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Aplicação profissional de tinta látex rolinhado em até 3 demãos. Não inclui o lixamento e aplicação de massa corrida.' WHERE name = 'Pintura Látex (Parede)' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Colocação e alinhamento de portal, batente, porta e fechadura. Inclui preenchimento de frestas com espuma expansiva.' WHERE name = 'Instalação de Porta' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Corte na parede, passagem de conduíte e cabeamento elétrico novo derivado da rede para instalação de nova tomada.' WHERE name = 'Ponto Elétrico Adicional' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Derivação de tubulação PVC ou CPVC para criação de nova saída de água (torneira) ou expansão de esgoto.' WHERE name = 'Ponto Hidráulico Adicional' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Diária padrão de até 8 horas in loco para serviços variados de alvenaria e acabamento civil. EPIs próprios inclusos.' WHERE name = 'Diária de Pedreiro' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Diária de servente para suporte operacional e carga/descarga de argamassas e materiais pesados no canteiro de obras.' WHERE name = 'Diária de Ajudante' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Instalação no esquadro, fixação metálica e enchimento do quadro. Serviço cobrado por peça unificada instalada.' WHERE name = 'Instalação de Janela' AND category_id = 'construction';
UPDATE public.template_services SET description = 'Limpeza rigorosa e aplicação de manta líquida ou asfáltica para bloquear totalmente a infiltração por intempéries.' WHERE name = 'Impermeabilização de Laje' AND category_id = 'construction';

-- Tecnologia
UPDATE public.template_services SET description = 'Furação da parede, travamento de suporte condensador/evaporador, clipagem de cobre (até 3 metros) e procedimento de carga com vácuo.' WHERE name = 'Instalação de Ar Condicionado Split' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Lavagem pressurizada dos coletores evaporadores (bolsa coletora in-loco) e aplicação de bactericida para eliminação de fungos.' WHERE name = 'Higienização de Ar Condicionado' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Backup preventivo (Até 50gb), Instalação limpa de Sistema Operacional de preferência e pacote Officer básico.' WHERE name = 'Formatação de Computador' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Deslocamento até o local e tempo analítico inical de até 1 hora destinado a descoberta de falhas ou dimensionamentos.' WHERE name = 'Visita Técnica' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Abertura cuidadosa de chassi sem perder presilhas plásticas, desconexão de flat-cable, parafusamento e testagem. Apenas mão de obra.' WHERE name = 'Troca de Tela de Notebook' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Parametrização do endereço lógico no modem (SSID, Senha OTP). Pode englobar criação de Vlans de visitantes ou ajuste de canais radiofrequencia.' WHERE name = 'Configuração de Rede Wi-Fi' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Fechamento de cabos normatizados e parafusamento de bastidores elétricos de acordo à norma NBR. Peça exclusiva de mão-de-obra.' WHERE name = 'Instalação de Tomada' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Colocação com veda-rosca, fixação elétrica usando conectores de porcelana seguros e verificação de disjuntor de curva.' WHERE name = 'Instalação de Chuveiro Elétrico' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Identificação de curva e isolamento no quadro de distribuição, com remoção do defeituoso e ancoragem exata da fiação na nova proteção.' WHERE name = 'Troca de Disjuntor' AND category_id = 'tech';
UPDATE public.template_services SET description = 'Fixação do motorização chumbada no forro, travamento de correntes, passagem do interruptor pela parede e fechamento capacitor.' WHERE name = 'Instalação de Ventilador de Teto' AND category_id = 'tech';

-- Beleza
UPDATE public.template_services SET description = 'Lavagem relaxante pré e pós, modelagem técnica e corte assimétrico. Secagem de finalização está incluída no protocolo.' WHERE name = 'Corte de Cabelo Feminino' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Máquina ou tesoura ajustado ao visagismo do cliente, mais finalização com pomada e assepsia fina no lavatório.' WHERE name = 'Corte Masculino' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Uso de Toalha Quente com ozonioterapia para abertura de folículos. Finalização na navalha com loção pós-shave perfumada.' WHERE name = 'Barba Completa' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Banho completo quimicamente validado (ácidos e blend de vitaminas) finalizado com alisamento em chapinha e reposição hídrica.' WHERE name = 'Escova Progressiva' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Higienização, amaciante para cutículas esterilizadas. Lixamento nivelador, pintura com esmaltação comum e extra de brilho.' WHERE name = 'Manicure' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Spa morno, remoção espessa e refinamento cuticular dos artelhos com segurança. Inclui massagem simples e pintura.' WHERE name = 'Pedicure' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Mapeamento facial técnico, depilação unificada na pinça/linha, respeitando volume e proporção. Opcional aplicação de henna pigmentada.' WHERE name = 'Design de Sobrancelhas' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Preparação blindada contra o suor. Olhos marcantes ou suaves fixados por setting-sprays focados na longevidade fotográfica da luz.' WHERE name = 'Maquiagem para Eventos' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Serviço global de cor usando tinturas ricas sem amônia se cabível, desde a raiz esticada às pontas sensíveis.' WHERE name = 'Coloração de Cabelo' AND category_id = 'beauty';
UPDATE public.template_services SET description = 'Protocolo vitamínico aplicado à cadeira com uso de vapores quentes com massageamento nutritivo no folículo capilar ressecado.' WHERE name = 'Hidratação Capilar' AND category_id = 'beauty';

-- Atualiza as descrições da tabela template_products para registros existentes

-- Automotivo P
UPDATE public.template_products SET description = 'Óleo Lubrificante 100% sintético classe SN (ex: Motul ou Mobil) para preservação agressiva da engrenagem do motor em alta quilometragem.' WHERE name = 'Óleo Motor 5W30' AND category_id = 'auto';
UPDATE public.template_products SET description = 'Filtro descartável blindado (Fram, Tecfil ou Original) feito para filtrar carbonizações finas até a próxima troca periódica.' WHERE name = 'Filtro de Óleo' AND category_id = 'auto';
UPDATE public.template_products SET description = 'Papel celulose plissado responsável pela captação limpa de ar para a admissão. Melhora combustão e previne pó no motor.' WHERE name = 'Filtro de Ar' AND category_id = 'auto';
UPDATE public.template_products SET description = 'Composto organo-metálico de atrito. Jogo frontal completo (4 blocos) focado no desgaste macio sem emitir assobios estridentes.' WHERE name = 'Jogo de Pastilhas de Freio' AND category_id = 'auto';
UPDATE public.template_products SET description = 'Frasco 500ml sintético de alta ebulição. Responsável por tracionar hidráulicamente o sistema de tambores e ABS dos carros modernos.' WHERE name = 'Fluido de Freio DOT4' AND category_id = 'auto';
UPDATE public.template_products SET description = 'Fluido de arrefecimento anticongelante e superaquecido enriquecido em inibidores orgânicos para zerar ferrugem.' WHERE name = 'Aditivo de Radiador' AND category_id = 'auto';
UPDATE public.template_products SET description = 'Carga liquefeita homologada fluorcarbono que efetua a inversão climática severa dentro das serpentinas da cabine interna.' WHERE name = 'Gás R134 (Ar Condicionado)' AND category_id = 'auto';

-- Construção P
UPDATE public.template_products SET description = 'Aglutinante principal CP-II robusto para lajes, fundações ou chapisco geral em tijolos com secagem controlada.' WHERE name = 'Cimento 50kg' AND category_id = 'construction';
UPDATE public.template_products SET description = 'Massa ensacada tipo AC2 ou AC3 (interior e exterior) pronta pra piso sobre piso ou áreas grandes em uso residencial.' WHERE name = 'Argamassa Cola 20kg' AND category_id = 'construction';
UPDATE public.template_products SET description = 'Balde 18 litros premium, ultra-resistente, lavável em até 2x, excelente rendimento de camada e não-queimadura uv ao sol.' WHERE name = 'Tinta Látex 18L' AND category_id = 'construction';
UPDATE public.template_products SET description = 'Peça tripla cega e espelho de encaixe com certificação INMETRO resistente a superaquecimento elétrico em amperagens usuais.' WHERE name = 'Tomada Completa' AND category_id = 'construction';
UPDATE public.template_products SET description = 'Condutor encordoado anti-chamas livre de metais pesados ideal para transpor circuitos fechados não-hibridos em painel Padrão.' WHERE name = 'Fio 2.5mm' AND category_id = 'construction';
UPDATE public.template_products SET description = 'Mangeira estanque e escoa sanitária para rede pluvial ou água limpa testada na injeção rígida.' WHERE name = 'Cano PVC 25mm' AND category_id = 'construction';
