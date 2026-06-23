/**
 * eventos_colonial.js
 * 
 * Contém a lista declarativa de eventos históricos e automáticos
 * para a 1ª Era (Brasil Colônia).
 */

export const eventosColoniais = [
  {
    id: "governo_geral_1548",
    nome: "Estabelecimento do Governo-Geral",
    tipo: "bifurcacao",
    ano_fixo: 1548,
    imagem: "assets/img/eventos/governo_geral.png",
    descricao: "Tomé de Sousa chega ao Brasil como o primeiro Governador-Geral, propondo centralizar o poder colonial sob Salvador (Bahia).",
    opcoes: [
      {
        id: "centralizar",
        texto: "Centralizar o Poder",
        descricao: "Aceitar a centralização. Custo imediato de 150 Contos para construção de Salvador, mas a arrecadação nacional aumenta em 10% de forma definitiva, e reduz a revolta na Bahia.",
        efeitos: {
          tesouro_delta: -150,
          bonus_arrecadacao_global: 0.10,
          revolta_delta: { bahia: -10 }
        }
      },
      {
        id: "resistir",
        texto: "Resistir à Centralização",
        descricao: "Os donatários das capitanias resistem ao poder do Governador. Sem custo imediato, mas a Coroa reage com maior pressão fiscal (+3% de alíquota global) e revolta aumenta em todas as capitanias.",
        efeitos: {
          tesouro_delta: 0,
          aliquota_delta_global: 0.03,
          revolta_delta_global: 8
        }
      }
    ]
  },
  {
    id: "fundacao_sp_1554",
    nome: "Fundação de São Paulo de Piratininga",
    tipo: "bifurcacao",
    ano_fixo: 1554,
    imagem: "assets/img/eventos/fundacao_sp.png",
    descricao: "Jesuítas liderados por Nóbrega e Anchieta fundam um colégio no planalto de Piratininga para catequização indígena. Há debate sobre como conduzir a colonização do interior.",
    opcoes: [
      {
        id: "focar_catequese",
        texto: "Apoiar Missões Jesuíticas (Catequese)",
        descricao: "Focar na pacificação e agricultura no planalto. Custo imediato de 80 Contos, reduz a revolta em São Vicente e São Tomé em 15% e aumenta o PIB de São Vicente em 10% de forma estável.",
        efeitos: {
          tesouro_delta: -80,
          revolta_delta: { sao_vicente: -15, sao_tome: -15 },
          pib_multiplicador: { sao_vicente: 1.10 }
        }
      },
      {
        id: "incentivar_bandeirantes",
        texto: "Incentivar Captura de Indígenas (Bandeiras)",
        descricao: "Permitir a captura e escravização de indígenas para lavouras locais. Sem custo para a coroa, injeta +100 Contos imediatos do comércio, mas a revolta em São Vicente e São Tomé sobe em 25% pelas guerras locais.",
        efeitos: {
          tesouro_delta: 100,
          revolta_delta: { sao_vicente: 25, sao_tome: 25 }
        }
      }
    ]
  },
  {
    id: "franca_antartica_1555",
    nome: "Ameaça da França Antártica",
    tipo: "bifurcacao",
    ano_fixo: 1555,
    imagem: "assets/img/eventos/franca_antartica.png",
    descricao: "Invasores franceses sob o comando de Villegagnon estabelecem a colônia da França Antártica na Baía de Guanabara, ameaçando a soberania portuguesa no sul.",
    opcoes: [
      {
        id: "expulsar_militarmente",
        texto: "Expulsão Militar",
        descricao: "Mobilizar tropas e fundar a cidade de Rio de Janeiro (-200 Contos). Isso garante a segurança do sul (+2 de Defesa em São Tomé e reduz a revolta local).",
        efeitos: {
          tesouro_delta: -200,
          milicia_delta: { sao_tome: 2 },
          revolta_delta: { sao_tome: -15 }
        }
      },
      {
        id: "negociar_territorio",
        texto: "Negociar Coexistência",
        descricao: "Aceitar a influência francesa no sul temporariamente. Economiza custos imediatos, mas o comércio colonial perde 30 Contos por ano nos próximos 10 anos devido ao contrabando de pau-brasil.",
        efeitos: {
          tesouro_delta: 0,
          penalidade_anual_global: { tipo: "tesouro", valor: -30, duracao_anos: 10 }
        }
      }
    ]
  },
  {
    id: "guerra_tamoios_1556",
    nome: "Confederação dos Tamoios",
    tipo: "bifurcacao",
    ano_fixo: 1556,
    imagem: "assets/img/eventos/guerra_tamoios.png",
    descricao: "Tribos Tupinambás (Tamoios) revoltam-se contra os abusos e escravidão das capitanias do sul, aliando-se aos invasores franceses do Rio de Janeiro. A colônia corre perigo.",
    opcoes: [
      {
        id: "armisticio_iperoig",
        texto: "Negociar Armistício de Iperoig",
        descricao: "Enviar os jesuítas para negociar uma trégua pacífica. Custo de 50 Contos. Reduz a revolta em São Vicente, Santo Amaro e São Tomé em 20%.",
        efeitos: {
          tesouro_delta: -50,
          revolta_delta: { sao_vicente: -20, sao_tome: -20 }
        }
      },
      {
        id: "combater_militarmente",
        texto: "Mobilizar Campanha Militar Total",
        descricao: "Armar os colonos e aliados indígenas rivais. Custo de 120 Contos. Reduz a revolta em São Vicente em 30% pelo esmagamento, mas aumenta a revolta em São Tomé/Rio em 15% devido aos conflitos, e concede +2 de milícia local a São Vicente e São Tomé.",
        efeitos: {
          tesouro_delta: -120,
          revolta_delta: { sao_vicente: -30, sao_tome: 15 },
          milicia_delta: { sao_vicente: 2, sao_tome: 2 }
        }
      }
    ]
  },
  {
    id: "uniao_iberica_1580",
    nome: "A Crise Sucessória e a União Ibérica",
    tipo: "bifurcacao",
    ano_fixo: 1580,
    imagem: "assets/img/eventos/uniao_iberica.png",
    descricao: "O Trono Português está vago e Filipe II da Espanha assume o poder, unificando as coroas. O Brasil deve decidir se aceita o domínio filipino ou resiste militarmente sob o nome de D. António, Prior do Crato.",
    opcoes: [
      {
        id: "aceitar_uniao",
        texto: "Aceitar a União Ibérica (Histórico)",
        descricao: "Unir as coroas sob o domínio espanhol. A alíquota de arrecadação global sobe em +2% de forma permanente devido a impostos espanhóis, o PIB de todas as capitanias cresce em 5% com a prata do Peru, mas nos tornamos alvo dos inimigos da Espanha (Holanda).",
        efeitos: {
          aliquota_delta_global: 0.02,
          pib_multiplicador: { pernambuco: 1.05, bahia: 1.05, sao_vicente: 1.05, maranhao: 1.05, ceara: 1.05, rio_grande: 1.05, itamaraca: 1.05, porto_seguro: 1.05, ilheus: 1.05, espirito_santo: 1.05, sao_tome: 1.05, santo_amaro: 1.05 }
        }
      },
      {
        id: "resistir_uniao",
        texto: "Rejeitar a Espanha e Declarar Lealdade a Portugal",
        descricao: "Manter fidelidade a D. António. Custo de 200 Contos imediatos para armar a defesa costeira e navios. Aumenta a revolta em todas as capitanias em 10% devido às divisões políticas internas, mas evitará a hostilidade holandesa direta.",
        efeitos: {
          tesouro_delta: -200,
          revolta_delta_global: 10
        }
      }
    ]
  },
  {
    id: "retaliacao_espanhola_1581",
    nome: "Retaliação da Armada Espanhola",
    tipo: "bifurcacao",
    ano_fixo: 1581,
    condicao: {
      decisao_requer: { evento_id: "uniao_iberica_1580", opcao_id: "resistir_uniao" }
    },
    imagem: "assets/img/eventos/invasao_holandesa.png",
    descricao: "Uma imponente armada espanhola surge no horizonte de Salvador e Rio de Janeiro para punir nossa lealdade a D. António e restaurar o domínio de Filipe II. Devemos organizar a defesa costeira.",
    opcoes: [
      {
        id: "defesa_naval",
        texto: "Engajar com Frotas e Milícias",
        descricao: "Lutar nas praias e fortes. Custo de 80 Contos em pólvora e reparos, e a revolta nas províncias litorâneas sobe em 10% devido às batalhas.",
        efeitos: {
          tesouro_delta: -80,
          revolta_delta: { bahia: 10, sao_tome: 10 }
        }
      },
      {
        id: "evacuar_costa",
        texto: "Evacuar Cidades e Praticar Guerra de Atrito",
        descricao: "Recuar para o interior com as riquezas. Sem custos imediatos de tropa, mas os espanhóis saqueiam Salvador e Rio, destruindo infraestruturas e drenando -150 Contos de comércio.",
        efeitos: {
          tesouro_delta: -150,
          pib_multiplicador: { bahia: 0.90, sao_tome: 0.90 }
        }
      }
    ]
  },
  {
    id: "seca_nordeste_1580",
    nome: "Grande Seca do Nordeste",
    tipo: "automatico",
    ano_fixo: 1580,
    imagem: "assets/img/eventos/seca_nordeste.png",
    descricao: "Uma terrível seca atinge as capitanias nordestinas, paralisando plantações de cana-de-açúcar e elevando as tensões sociais.",
    efeitos: {
      penalidade_anual_regiao: { regiao: "nordeste", tipo: "pib_penalidade", valor: 0.85, duracao_anos: 5 },
      revolta_delta_regiao: { regiao: "nordeste", valor: 15 }
    }
  },
  {
    id: "invasao_salvador_1624",
    nome: "Invasão Holandesa de Salvador",
    tipo: "bifurcacao",
    ano_fixo: 1624,
    imagem: "assets/img/eventos/invasao_holandesa.png",
    descricao: "A Companhia Holandesa das Índias Ocidentais (WIC) ataca a capital Salvador. O Governador foi capturado e o caos impera.",
    opcoes: [
      {
        id: "resistencia_armada_salvador",
        texto: "Jornada dos Vassalos (Resistência Armada)",
        descricao: "Pagar 150 Contos para armar a frota de retomada militar. Salvador sofre destruição imediata (Bahia perde 20% do PIB por 3 anos), mas a revolta é contida.",
        efeitos: {
          tesouro_delta: -150,
          penalidade_anual_estado: { estadoId: "bahia", tipo: "pib_penalidade", valor: 0.80, duracao_anos: 3 },
          revolta_delta: { bahia: -15 }
        }
      },
      {
        id: "recuar_interior",
        texto: "Recuar para o Interior (Guerra de Atrito)",
        descricao: "Sem custo financeiro imediato de tropas, permitindo o saque holandês. Perdemos 80 Contos do Tesouro e a Bahia sofre bloqueio comercial severo (-20% PIB por 5 anos).",
        efeitos: {
          tesouro_delta: -80,
          penalidade_anual_estado: { estadoId: "bahia", tipo: "pib_penalidade", valor: 0.80, duracao_anos: 5 },
          revolta_delta: { bahia: 10 }
        }
      }
    ]
  },
  {
    id: "invasao_holandesa_1630",
    nome: "Invasão Holandesa de Pernambuco",
    tipo: "bifurcacao",
    ano_fixo: 1630,
    condicao: {
      decisao_exclui: { evento_id: "uniao_iberica_1580", opcao_id: "resistir_uniao" }
    },
    imagem: "assets/img/eventos/invasao_holandesa.png",
    descricao: "A Companhia Holandesa das Índias Ocidentais (WIC) invade a próspera Capitania de Pernambuco para tomar o controle do Ciclo do Açúcar.",
    opcoes: [
      {
        id: "resistencia_armada",
        texto: "Resistência Armada",
        descricao: "Financiar a resistência militar (-300 Contos). Pernambuco sofre destruição imediata (PIB cai pela metade por 5 anos), mas ganha fortificações (+3 Defesa).",
        efeitos: {
          tesouro_delta: -300,
          penalidade_anual_estado: { estadoId: "pernambuco", tipo: "pib_penalidade", valor: 0.5, duracao_anos: 5 },
          milicia_delta: { pernambuco: 3 }
        }
      },
      {
        id: "capitular",
        texto: "Capitular e Negociar",
        descricao: "Evitar a guerra imediata aceitando o domínio holandês. Pernambuco perde 70% da arrecadação de impostos por 20 anos, mas preserva seu PIB intacto.",
        efeitos: {
          tesouro_delta: 0,
          penalidade_anual_estado: { estadoId: "pernambuco", tipo: "arrecadacao_penalidade", valor: 0.70, duracao_anos: 20 },
          set_status_territorio: {
            estadoId: "pernambuco",
            status: "invadido",
            invadido_por: "holanda",
            duracao_invasao: 20
          }
        }
      }
    ]
  },
  {
    id: "alianca_holandesa_1630",
    nome: "Tratado Comercial com a Holanda",
    tipo: "bifurcacao",
    ano_fixo: 1630,
    condicao: {
      decisao_requer: { evento_id: "uniao_iberica_1580", opcao_id: "resistir_uniao" }
    },
    imagem: "assets/img/eventos/invasao_holandesa.png",
    descricao: "Como o Brasil manteve-se leal a Portugal e resisteu ao domínio espanhol, a Holanda (principal inimiga da Espanha) envia uma embaixada pacífica propondo um tratado comercial de açúcar e ajuda militar contra as frotas de Filipe II.",
    opcoes: [
      {
        id: "aceitar_alianca",
        texto: "Firmar Aliança Comercial e Militar",
        descricao: "Aceitar a aliança holandesa. Injeta +150 Contos imediatos no tesouro, aumenta o PIB de Pernambuco, Itamaracá e Bahia em 15% permanentemente, e nos dá +2 de Defesa nessas capitanias.",
        efeitos: {
          tesouro_delta: 150,
          pib_multiplicador: { pernambuco: 1.15, itamaraca: 1.15, bahia: 1.15 },
          milicia_delta: { pernambuco: 2, itamaraca: 2, bahia: 2 }
        }
      },
      {
        id: "recusar_alianca",
        texto: "Recusar Aliança (Manter Pureza Lusa)",
        descricao: "Recusar a proposta dos holandeses protestantes. Sem benefícios financeiros imediatos. A revolta em Pernambuco aumenta em 10% devido ao descontentamento dos barões do açúcar, mas a Coroa Portuguesa em exílio envia um subsídio de 50 Contos.",
        efeitos: {
          tesouro_delta: 50,
          revolta_delta: { pernambuco: 10 }
        }
      }
    ]
  },
  {
    id: "quilombo_palmares",
    nome: "Resistência de Palmares",
    tipo: "bifurcacao",
    condicao: {
      ano_minimo: 1670,
      ano_maximo: 1695,
      algum_estado: {
        estado_especifico: "pernambuco",
        pib_minimo: 150,
        revolta_minimo: 15
      }
    },
    imagem: "assets/img/eventos/quilombo_palmares.png",
    descricao: "O Quilombo dos Palmares cresce de forma sem precedentes em Alagoas, atraindo escravizados fugidos e desestabilizando a produção de açúcar de Pernambuco.",
    opcoes: [
      {
        id: "destruir_militarmente",
        texto: "Contratar Domingos Jorge Velho",
        descricao: "Pagar 200 Contos aos bandeirantes para liderar uma campanha de destruição. A revolta em Pernambuco é esmagada (-25% de revolta) e o estado ganha fortificações locais (+1 Defesa).",
        efeitos: {
          tesouro_delta: -200,
          revolta_delta: { pernambuco: -25 },
          milicia_delta: { pernambuco: 1 }
        }
      },
      {
        id: "tratado_ganga_zumba",
        texto: "Tratado de Ganga Zumba (Autonomia)",
        descricao: "Conceder liberdade aos nascidos em Palmares em troca de cessar os ataques. Sem custos de campanha militar imediata, reduz a revolta (-10% em Pernambuco e Itamaracá), mas a Coroa exige uma multa de 50 Contos pelas perdas.",
        efeitos: {
          tesouro_delta: -50,
          revolta_delta: { pernambuco: -10, itamaraca: -10 }
        }
      }
    ]
  },
  {
    id: "ciclo_ouro_1693",
    nome: "Descoberta de Ouro nas Minas Gerais",
    tipo: "bifurcacao",
    condicao: {
      ano_fixo: 1693,
      investimento_exploracao_minimo: 100,
      algum_estado: {
        estado_especifico: "sao_vicente",
        defesa_maximo: 10
      }
    },
    imagem: "assets/img/eventos/ciclo_ouro_inconfidencia.png",
    descricao: "Bandeirantes encontram ricas jazidas de ouro no interior de São Vicente (Minas Gerais). Começa uma imensa febre do ouro nacional.",
    opcoes: [
      {
        id: "quinto_e_fundicao",
        texto: "Decretar o Quinto e as Casas de Fundição",
        descricao: "Criar rigorosos controles fiscais. A arrecadação nacional aumenta em 15% de forma definitiva, mas as pressões locais elevam a revolta em São Vicente (+25%).",
        efeitos: {
          bonus_arrecadacao_global: 0.15,
          revolta_delta: { sao_vicente: 25 }
        }
      },
      {
        id: "mineracao_livre",
        texto: "Mineração Livre (Foco no Comércio)",
        descricao: "Atrair colonos e comércio com impostos leves. O PIB de São Vicente aumenta imediatamente em 40%, mas o Tesouro só recebe uma taxa de registro única de 100 Contos.",
        efeitos: {
          tesouro_delta: 100,
          pib_multiplicador: { sao_vicente: 1.40 }
        }
      }
    ]
  },
  {
    id: "inconfidencia_mineira_1789",
    nome: "A Inconfidência Mineira",
    tipo: "bifurcacao",
    condicao: {
      ano_fixo: 1789,
      algum_estado: {
        estado_especifico: "sao_vicente",
        revolta_minimo: 20,
        aliquota_minimo: 0.15
      }
    },
    imagem: "assets/img/eventos/ciclo_ouro_inconfidencia.png",
    descricao: "Elite letrada e militar em Vila Rica (Minas Gerais/São Vicente) conspira contra a Coroa sob a ameaça da derrama (cobrança forçada do Quinto atrasado).",
    opcoes: [
      {
        id: "devassa_forca",
        texto: "Devassa e Execução Exemplar (Tiradentes)",
        descricao: "Prender os líderes e aplicar punição máxima. Custo militar de 50 Contos. A revolta em São Vicente cai em 15% pelo medo, mas gera um clima de terror que reduz o PIB da Bahia e Leste (-10% por 3 anos).",
        efeitos: {
          tesouro_delta: -50,
          revolta_delta: { sao_vicente: -15 },
          penalidade_anual_regiao: { regiao: "leste", tipo: "pib_penalidade", valor: 0.90, duracao_anos: 3 }
        }
      },
      {
        id: "suspender_derrama",
        texto: "Perdoar Dívidas (Suspender a Derrama)",
        descricao: "Ceder às exigências para acalmar as províncias. Custo imediato de 150 Contos in impostos perdoados, a revolta cai em São Vicente e São Tomé (-25%), mas a alíquota em São Vicente cai 5%.",
        efeitos: {
          tesouro_delta: -150,
          revolta_delta: { sao_vicente: -25, sao_tome: -25 },
          aliquota_delta: { sao_vicente: -0.05 }
        }
      }
    ]
  },
  {
    id: "independencia_precoce",
    nome: "O Clamor pela Emancipação",
    tipo: "bifurcacao_independencia",
    condicao: {
      ano_minimo: 1790,
      ano_maximo: 1821,
      pib_nacional_minimo: 1200,
      tesouro_nacional_minimo: 600,
      media_revolta_minima: 35,
      independencia_nao_ocorreu: true
    },
    imagem: "assets/img/eventos/independencia_precoce.png",
    descricao: "As capitanias do Brasil prosperam além do controle de Lisboa. A elite colonial — bacharéis, militares e fazendeiros — começa a articular uma ruptura com Portugal. As condições econômicas e o clima de descontentamento criaram o momento ideal para a independência, décadas antes do previsto pela história.",
    opcoes: [
      {
        id: "proclamar_independencia_precoce",
        texto: "⚡ Proclamar a Independência Agora! (Ucrônico)",
        descricao: "Romper com Portugal antecipadamente. A colônia transforma-se em nação soberana. O Tesouro cresce em +200 Contos (fim das remessas a Lisboa), mas a revolta sobe em 20% em todas as capitanias pelo caos da transição. A Era Colonial termina.",
        tipo_resultado: "ucronica",
        efeitos: {
          tesouro_delta: 200,
          revolta_delta_global: 20,
          fim_da_era_trigger: true
        }
      },
      {
        id: "adiar_independencia",
        texto: "⏳ Aguardar — O Momento Ainda Não Chegou",
        descricao: "Suprimir os movimentos por ora. Custo político de 80 Contos para pacificar os líderes, reduz a revolta em 10% globalmente. A janela de independência permanece aberta para os próximos anos se as condições se mantiverem.",
        tipo_resultado: "historica",
        efeitos: {
          tesouro_delta: -80,
          revolta_delta_global: -10,
          adiar_independencia_anos: 8
        }
      }
    ]
  },
  {
    id: "independencia_1822",
    nome: "O Grito do Ipiranga",
    tipo: "bifurcacao_independencia",
    ano_fixo: 1822,
    condicao: {
      independencia_nao_ocorreu: true
    },
    imagem: "assets/img/eventos/independencia.png",
    descricao: "Dom Pedro I, às margens do Riacho do Ipiranga, em São Paulo, arranca o laço de Portugal de seu chapéu e exclama: 'Independência ou Morte!'. O Brasil chega ao momento histórico de separação de Portugal após séculos de colonização. O futuro da nação depende da escolha que será feita agora.",
    opcoes: [
      {
        id: "proclamar_dom_pedro",
        texto: "👑 Independência com Dom Pedro I (Histórico)",
        descricao: "Apoiar Dom Pedro como Imperador do Brasil. A transição se dá de forma relativamente pacífica. Herança imperial começa com estabilidade moderada. A Era Colonial chega ao fim com glória.",
        tipo_resultado: "historica",
        efeitos: {
          tesouro_delta: 0,
          revolta_delta_global: -5,
          fim_da_era_trigger: true
        }
      },
      {
        id: "regresso_dom_joao",
        texto: "⚡ Forçar o Regresso de Dom João VI — Brasil Autônomo (Ucrônico)",
        descricao: "Em vez de romper totalmente, pressionar pela criação de um reino unido autônomo. Dom João VI permanece no Brasil e negocia maior autonomia sem independência formal. Gera instabilidade política e crise diplomática, mas mantém os laços com Portugal e a Coroa. +15% de revolta nacional.",
        tipo_resultado: "ucronica",
        efeitos: {
          tesouro_delta: -100,
          revolta_delta_global: 15,
          fim_da_era_trigger: true
        }
      }
    ]
  }
];
