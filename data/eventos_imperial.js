/**
 * eventos_imperial.js
 * 
 * Contém a lista declarativa de eventos históricos e automáticos
 * para a 2ª Era (Brasil Império).
 */

export const eventosImperiais = [
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
