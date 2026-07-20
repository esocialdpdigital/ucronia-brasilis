/**
 * eventos_imperial.js
 * 
 * Contém a lista declarativa de eventos históricos e automáticos
 * para a 2ª Era (Brasil Império).
 */

export const eventosImperiais = [
  {
    id: "constituicao_1824",
    nome: "A Assembleia Constituinte e a Constituição de 1824",
    tipo: "bifurcacao",
    ano_fixo: 1824,
    imagem: "assets/img/eventos/independencia.png",
    descricao: "Em meio a intensos debates na Assembleia Constituinte, Dom Pedro I entra em choque com a bancada liberal sobre a limitação dos poderes monárquicos. Cabe decidir a estrutura política do recém-nascido Império do Brasil.",
    opcoes: [
      {
        id: "outorgar_constituicao",
        texto: "👑 Outorgar a Constituição de 1824 (Poder Moderador)",
        descricao: "Dissolver a Assembleia Constituinte e impor a Constituição outorgada, consagrando o Poder Moderador Supremo do Imperador. Centraliza a autoridade no Rio de Janeiro, mas eleva a revolta nas províncias liberais em +15%.",
        efeitos: {
          tesouro_delta: 50,
          revolta_delta_global: 15,
          revolta_delta: { pernambuco: 20, bahia: 15, rio_grande_do_sul: 15 }
        }
      },
      {
        id: "aceitar_constituinte_liberal",
        texto: "📜 Aceitar o Projeto Liberal Constituinte (Monarquia Parlamentar)",
        descricao: "Aprovar a 'Constituição da Mandioca' e submeter a autoridade do Imperador ao Parlamento. Suprime o Poder Moderador, reduz a revolta global (-10%), mas gera descontentamento entre a elite mercantil portuguesa do Rio de Janeiro.",
        efeitos: {
          tesouro_delta: -30,
          revolta_delta_global: -10,
          penalidade_anual_estado: { estadoId: "rio_de_janeiro", tipo: "arrecadacao_penalidade", valor: 0.90, duracao_anos: 4 }
        }
      }
    ]
  },
  {
    id: "confederacao_equador_1824",
    nome: "A Confederação do Equador",
    tipo: "bifurcacao",
    ano_fixo: 1824,
    condicao: {
      algum_estado: { estado_especifico: "pernambuco", revolta_minimo: 10 }
    },
    imagem: "assets/img/eventos/revolucao_pernambucana.png",
    descricao: "Inconformados com o centralismo do Rio de Janeiro e o absolutismo da Constituição outorgada, patriotas pernambucanos liderados por Frei Caneca proclamam a República da Confederação do Equador, atraindo Ceará, Paraíba e Rio Grande do Norte.",
    opcoes: [
      {
        id: "esmagar_confederacao",
        texto: "⚔️ Contratar a Esquadra de Cochrane (Repressão Militar)",
        descricao: "Financiar a frota mercenária britânica (-180 Contos) para bombardear o Recife e executar a liderança rebelde. Zera a revolta em Pernambuco e Ceará, mas deixa sequelas na economia nordestina.",
        efeitos: {
          tesouro_delta: -180,
          revolta_delta: { pernambuco: -40, ceara: -30 },
          penalidade_anual_estado: { estadoId: "pernambuco", tipo: "pib_penalidade", valor: 0.80, duracao_anos: 3 }
        }
      },
      {
        id: "pacto_federalista_nordeste",
        texto: "🤝 Pacto de Autonomia Nordestina (Federalismo)",
        descricao: "Conceder ampla autonomia tributária e legislativa ao Nordeste para evitar a guerra civil. Custa -50 Contos de caixa e reduz o repasse federal de Pernambuco em 20%, mas pacifica pacificamente a região.",
        efeitos: {
          tesouro_delta: -50,
          revolta_delta: { pernambuco: -20, ceara: -20 },
          aliquota_delta: { pernambuco: -0.10, ceara: -0.10 }
        }
      }
    ]
  },
  {
    id: "guerra_cisplatina_1825",
    nome: "Guerra da Cisplatina",
    tipo: "bifurcacao",
    ano_fixo: 1825,
    imagem: "assets/img/eventos/invasao_holandesa.png",
    descricao: "Os 'Trinta e Três Orientais' de Juan Antonio Lavalleja declaram a separação da Província Cisplatina do Império do Brasil para integrar as Províncias Unidas do Rio da Prata (Argentina). O bloqueio naval e os combates terrestres drenam a economia.",
    opcoes: [
      {
        id: "reconhecer_uruguai",
        texto: "📜 Convenção Preliminar de Paz (Independência do Uruguai)",
        descricao: "Aceitar a mediação britânica (-80 Contos em custas diplomáticas) e reconhecer a criação da República Oriental do Uruguai como estado tampão neutralizado. Evita a bancarrota do Tesouro Imperial.",
        efeitos: {
          tesouro_delta: -80,
          revolta_delta_global: 5
        }
      },
      {
        id: "guerra_total_cisplatina",
        texto: "⚔️ Guerra Total e Anexação Definitiva da Cisplatina",
        descricao: "Mobilizar frotas e regimentos de elite para sufocar a resistência no Prata (-280 Contos). Drena o Tesouro e força a emissão sem lastro (falência do Banco do Brasil em 1829), mas **mantém a Cisplatina no território nacional**!",
        efeitos: {
          tesouro_delta: -280,
          revolta_delta_global: 15,
          set_status_territorio: { estadoId: "rio_grande_do_sul", status: "controlado" }
        }
      }
    ]
  },
  {
    id: "abdicacao_pedro_i_1831",
    nome: "Noite das Garrafadas e Abdicação de Dom Pedro I",
    tipo: "bifurcacao",
    ano_fixo: 1831,
    imagem: "assets/img/eventos/independencia.png",
    descricao: "Conflitos sangrentos nas ruas da capital entre a facção brasileira e os comerciantes portugueses (Noite das Garrafadas) culminam em uma revolta militar no Campo de Santana. O povo e a tropa exigem a renúncia de Dom Pedro I.",
    opcoes: [
      {
        id: "abdicar_pedro_ii",
        texto: "👑 Abdicar em Favor de Dom Pedro II (Início da Regência)",
        descricao: "Dom Pedro I renuncia ao trono e parte para a Europa, deixando seu filho de 5 anos sob a tutoria da Regência Trina. Acalma a revolta popular (-15% Revolta Global) e estabiliza a Monarquia.",
        efeitos: {
          tesouro_delta: 0,
          revolta_delta_global: -15
        }
      },
      {
        id: "resistencia_absolutista",
        texto: "⚔️ Declarar Estado de Sítio e Tentar Ditadura Monárquica",
        descricao: "Recusar a renúncia e governar pela força das armas. Dispara uma Guerra Civil dinástica: o Rio de Janeiro e a Bahia entram em rebelião imediata (+35% Revolta Global).",
        efeitos: {
          tesouro_delta: -100,
          revolta_delta_global: 35,
          revolta_delta: { bahia: 30, rio_de_janeiro: 40 }
        }
      }
    ]
  },
  {
    id: "cabanagem_1835",
    nome: "A Cabanagem no Grão-Pará",
    tipo: "bifurcacao",
    condicao: {
      ano_fixo: 1835,
      algum_estado: { estado_especifico: "grao_para", revolta_minimo: 10 }
    },
    imagem: "assets/img/eventos/cabanagem.png",
    descricao: "A população ribeirinha, indígena e mestiça do Grão-Pará revolta-se contra a extrema pobreza e a nomeação de governantes impopulares pela Regência. Os rebeldes tomam Belém e declaram um governo autônomo.",
    opcoes: [
      {
        id: "esmagar_cabanagem",
        texto: "⚔️ Esmagar a Cabanagem (Repressão Militar)",
        descricao: "Enviar tropas imperiais para restabelecer a autoridade à força. Custará -150 Contos e causará queda econômica local (-15% PIB do Grão-Pará por 5 anos), mas controlará a revolta local.",
        efeitos: {
          tesouro_delta: -150,
          revolta_delta: { grao_para: -40 },
          penalidade_anual_estado: { estadoId: "grao_para", tipo: "pib_penalidade", valor: 0.85, duracao_anos: 5 },
          set_status_territorio: { estadoId: "grao_para", status: "controlado" }
        }
      },
      {
        id: "negociar_cabanagem",
        texto: "🤝 Conter e Negociar (Retirada Tática)",
        descricao: "Evitar custos militares diretos imediatos e negociar autonomia com as elites locais. Custa -40 Contos, mas o Grão-Pará continuará revoltado (+30% Revolta) e sob status 'rebelado' por 5 anos.",
        efeitos: {
          tesouro_delta: -40,
          revolta_delta: { grao_para: 30 },
          set_status_territorio: { estadoId: "grao_para", status: "rebelado", duracao_invasao: 5 }
        }
      }
    ]
  },
  {
    id: "farroupilha_1835",
    nome: "Guerra dos Farrapos",
    tipo: "bifurcacao",
    condicao: {
      ano_fixo: 1835,
      algum_estado: { estado_especifico: "rio_grande_do_sul", revolta_minimo: 10 }
    },
    imagem: "assets/img/eventos/farroupilha.png",
    descricao: "Estancieiros e militares gaúchos revoltam-se contra os altos impostos imperiais aplicados sobre o charque nacional, proclamando a República Rio-Grandense.",
    opcoes: [
      {
        id: "combate_militar_farroupilha",
        texto: "⚔️ Campanha Militar de Caxias",
        descricao: "Enviar forças federais lideradas pelo Barão de Caxias para sufocar a rebelião em uma longa campanha de pacificação. Custará -200 Contos de caixa e gerará leve descontentamento nacional (+5% Revolta global).",
        efeitos: {
          tesouro_delta: -200,
          revolta_delta: { rio_grande_do_sul: -50 },
          revolta_delta_global: 5,
          set_status_territorio: { estadoId: "rio_grande_do_sul", status: "controlado" }
        }
      },
      {
        id: "paz_ponche_verde",
        texto: "🤝 Tratado de Ponche Verde (Paz Negociada)",
        descricao: "Firmar a paz incorporando oficiais farroupilhas ao Exército e reduzindo as tarifas sobre o charque. Custa -80 Contos imediatos e reduz permanentemente a alíquota em -5% no Rio Grande do Sul.",
        efeitos: {
          tesouro_delta: -80,
          revolta_delta: { rio_grande_do_sul: -30 },
          aliquota_delta: { rio_grande_do_sul: -0.05 },
          set_status_territorio: { estadoId: "rio_grande_do_sul", status: "controlado" }
        }
      }
    ]
  },
  {
    id: "sabinada_1837",
    nome: "A Sabinada na Bahia",
    tipo: "bifurcacao",
    condicao: {
      ano_fixo: 1837,
      algum_estado: { estado_especifico: "bahia", revolta_minimo: 10 }
    },
    imagem: "assets/img/eventos/sabinada.png",
    descricao: "Liderada pelo médico Sabino Barroso, a classe média soteropolitana proclama a República Bahiana, insatisfeita com o recrutamento militar forçado imposto pelo Rio de Janeiro.",
    opcoes: [
      {
        id: "cercar_salvador",
        texto: "⚔️ Bloqueio e Cerco Militar",
        descricao: "Cercar a capital Salvador por mar e terra. Custará -80 Contos e causará queda econômica na Bahia (-15% PIB por 3 anos), mas restabelecerá o controle do território.",
        efeitos: {
          tesouro_delta: -80,
          revolta_delta: { bahia: -25 },
          penalidade_anual_estado: { estadoId: "bahia", tipo: "pib_penalidade", valor: 0.85, duracao_anos: 3 },
          set_status_territorio: { estadoId: "bahia", status: "controlado" }
        }
      },
      {
        id: "anistia_parcial",
        texto: "🤝 Anistia Política aos Líderes",
        descricao: "Evitar conflitos diretos anistiando os rebeldes moderados. Custará -30 Contos, mas Salvador permanecerá rebelada e inacessível por 3 anos.",
        efeitos: {
          tesouro_delta: -30,
          revolta_delta: { bahia: 10 },
          set_status_territorio: { estadoId: "bahia", status: "rebelado", duracao_invasao: 3 }
        }
      }
    ]
  },
  {
    id: "balaiada_1838",
    nome: "A Balaiada no Maranhão",
    tipo: "bifurcacao",
    condicao: {
      ano_fixo: 1838,
      algum_estado: { estado_especifico: "maranhao", revolta_minimo: 10 }
    },
    imagem: "assets/img/eventos/balaiada.png",
    descricao: "Uma revolta popular de vaqueiros, artesãos e escravizados fugidos estoura no interior do Maranhão contra a opressão dos grandes proprietários conservadores.",
    opcoes: [
      {
        id: "enviar_caxias",
        texto: "⚔️ Enviar Forças Imperiais de Pacificação",
        descricao: "Designar forças federais de pacificação para sufocar os balaios. Custará -100 Contos e zerará a revolta local no Maranhão.",
        efeitos: {
          tesouro_delta: -100,
          revolta_delta: { maranhao: -35 },
          set_status_territorio: { estadoId: "maranhao", status: "controlado" }
        }
      },
      {
        id: "policiamento_local",
        texto: "🛡️ Apoiar a Milícia dos Senhores de Terra",
        descricao: "Financiar a repressão por milícias locais com -20 Contos, deixando a responsabilidade com os latifundiários. O Maranhão permanecerá rebelado por 4 anos.",
        efeitos: {
          tesouro_delta: -20,
          revolta_delta: { maranhao: 15 },
          set_status_territorio: { estadoId: "maranhao", status: "rebelado", duracao_invasao: 4 }
        }
      }
    ]
  },
  {
    id: "guerra_paraguai_1864",
    nome: "Guerra da Tríplice Aliança",
    tipo: "bifurcacao",
    condicao: {
      ano_fixo: 1864
    },
    imagem: "assets/img/eventos/guerra_paraguai.png",
    descricao: "O presidente paraguaio Solano López invade o Mato Grosso e confisca o navio imperial Marquês de Olinda. O Brasil junta-se a Uruguai e Argentina na Tríplice Aliança contra o Paraguai.",
    opcoes: [
      {
        id: "recrutamento_voluntario",
        texto: "📜 Voluntários da Pátria e Empréstimos",
        descricao: "Organizar o corpo de 'Voluntários da Pátria' e obter crédito financeiro de Londres. Custará -300 Contos de caixa ao Tesouro e causará leve descontentamento nacional (+5% Revolta global).",
        efeitos: {
          tesouro_delta: -300,
          revolta_delta_global: 5
        }
      },
      {
        id: "conscricao_forcada",
        texto: "⚡ Conscrição Forçada e Impostos Extraordinários",
        descricao: "Decretar recrutamento forçado de civis e criar novos impostos de guerra. Reduz o custo para -150 Contos, mas eleva a revolta nacional substancialmente (+20% Revolta global).",
        efeitos: {
          tesouro_delta: -150,
          revolta_delta_global: 20
        }
      }
    ]
  },
  {
    id: "lei_aurea_1888",
    nome: "A Abolição da Escravidão",
    tipo: "bifurcacao_independencia",
    condicao: {
      ano_fixo: 1888
    },
    imagem: "assets/img/eventos/lei_aurea.png",
    descricao: "A Princesa Isabel apresenta a Lei Áurea ao Parlamento. A extinção da escravidão é celebrada pela população urbana, mas os grandes proprietários de terras do Sudeste cafeeiro sentem-se traídos e ameaçam aderir à causa republicana se não forem indenizados.",
    opcoes: [
      {
        id: "proclamar_lei_aurea",
        texto: "🕊️ Assinar a Lei Áurea (Abolição)",
        descricao: "Extinguir imediatamente a escravidão. Reduz a revolta nacional em -20%, mas causa queda econômica imediata de -10% a -15% do PIB nas províncias cafeeiras e agrícolas tradicionais (SP, RJ, MG, BA, PE) devido à desorganização da mão de obra. O Período Imperial encerra-se.",
        tipo_resultado: "historica",
        efeitos: {
          pib_multiplicador: {
            sao_paulo: 0.85,
            rio_de_janeiro: 0.85,
            minas_gerais: 0.90,
            bahia: 0.90,
            pernambuco: 0.90
          },
          revolta_delta_global: -20,
          fim_da_era_trigger: true
        }
      },
      {
        id: "vetar_lei_aurea",
        texto: "👑 Vetar a Lei Áurea (Preservar Oligarquias)",
        descricao: "Vetar o projeto parlamentar para assegurar a lealdade dos cafeicultores. Preserva os PIBs intactos, mas a revolta popular explode em todas as províncias (+30% Revolta global). O Período Imperial encerra-se.",
        tipo_resultado: "ucronica",
        efeitos: {
          revolta_delta_global: 30,
          fim_da_era_trigger: true
        }
      }
    ]
  }
];
