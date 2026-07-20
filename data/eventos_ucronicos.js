/**
 * eventos_ucronicos.js
 * 
 * Banco de dados de eventos puramente fictícios e ucrônicos.
 * Estes eventos são injetados na linha do tempo pelo Timeline Engine
 * quando a divergência histórica ultrapassa limites críticos ou quando
 * o estado do jogo cria realidades alternativas profundas.
 */

export const eventosUcronicos = [
  {
    id: "ucronia_incursao_inglesa_1720",
    nome: "A Incursão Corsária Inglesa no Sudeste",
    tipo: "bifurcacao",
    era: "colonial",
    imagem: "assets/img/eventos/invasao_holandesa.png",
    descricao: "Com a divergência econômica do Brasil e a fragilidade do comércio atlântico, uma flotilha de corsários ingleses financiada por comerciantes de Bristol ataca os portos do Sudeste exigindo livre comércio.",
    condicao_ucronica: {
      divergencia_minima: 0.25,
      ano_minimo: 1710,
      ano_maximo: 1760
    },
    opcoes: [
      {
        id: "pagar_resgate",
        texto: "Pagar Resgate e Abrir Concessões Comerciais",
        descricao: "Pagar 120 Contos para evitar o bombardeio das docas. Aumenta o PIB do Sudeste em 10% pelo contrabando, mas reduz a retenção da União.",
        efeitos: {
          tesouro_delta: -120,
          pib_multiplicador: { sao_vicente: 1.10, sao_tome: 1.10 }
        }
      },
      {
        id: "combater_corsarios",
        texto: "Engajar as Milícias Costeiras e Fortificar Portos",
        descricao: "Repelir os corsários à força. Custo de 80 Contos. A revolta local cai em 10% pelo orgulho nativista, e a defesa aumenta.",
        efeitos: {
          tesouro_delta: -80,
          milicia_delta: { sao_vicente: 2, sao_tome: 2 }
        }
      }
    ]
  },
  {
    id: "ucronia_rebeldia_paulista_1775",
    nome: "O Manifesto Republicano do Planalto",
    tipo: "bifurcacao",
    era: "colonial",
    imagem: "assets/img/eventos/ciclo_ouro_inconfidencia.png",
    descricao: "Impulsionados pela autonomia dos bandeirantes e pela alta divergência com Lisboa, os líderes de São Paulo e Minas Gerais declaram um pacto republicano confederado do interior.",
    condicao_ucronica: {
      divergencia_minima: 0.35,
      ano_minimo: 1770,
      ano_maximo: 1810
    },
    opcoes: [
      {
        id: "conceder_autonomia_planalto",
        texto: "Reconhecer Foro Especial às Capitanias do Interior",
        descricao: "Ceder autonomia tributária às capitanias do interior. Evita rebelião armada (-20% revolta), mas reduz a arrecadação da União em 20%.",
        efeitos: {
          revolta_delta: { sao_vicente: -20, sao_tome: -10 },
          penalidade_anual_estado: { estadoId: "sao_vicente", tipo: "arrecadacao_penalidade", valor: 0.20, duracao_anos: 10 }
        }
      },
      {
        id: "esmagar_manifesto",
        texto: "Enviar Tropas de Linha da Capital para Pacificar",
        descricao: "Reprimir duramente os conspiradores (-150 Contos). Eleva a revolta no Sudeste (+15%), mas preserva o controle fiscal rigoroso.",
        efeitos: {
          tesouro_delta: -150,
          revolta_delta: { sao_vicente: 15 }
        }
      }
    ]
  },
  {
    id: "ucronia_confederacao_nordeste_1810",
    nome: "A Liga das Capitanias do Norte",
    tipo: "bifurcacao",
    era: "colonial",
    imagem: "assets/img/eventos/revolucao_pernambucana.png",
    descricao: "Diante da instabilidade metropolitana e da alta autonomia adquirida pelas províncias açucareiras, Pernambuco, Bahia e Maranhão formam uma aliança defensiva contra ordens centrais.",
    condicao_ucronica: {
      divergencia_minima: 0.30,
      ano_minimo: 1800,
      ano_maximo: 1820
    },
    opcoes: [
      {
        id: "pactuar_liga",
        texto: "Firmar Pacto de Coerção mútua e Manter a União",
        descricao: "Pagar 100 Contos em subsídios de infraestrutura aos portos do Norte. A revolta no Nordeste cai em 25%.",
        efeitos: {
          tesouro_delta: -100,
          revolta_delta: { pernambuco: -25, bahia: -25, maranhao: -25 }
        }
      },
      {
        id: "declarar_ilegal",
        texto: "Declarar a Liga Ilegal e Bloquear o Comércio",
        descricao: "Retalhar as capitanias norteiras. Provoca greve fiscal e aumento de 20% na revolta global do Nordeste.",
        efeitos: {
          revolta_delta_regiao: { regiao: "nordeste", valor: 20 }
        }
      }
    ]
  }
];
