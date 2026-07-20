/**
 * enciclopedia.js
 * 
 * Dados declarativos da Biblioteca Histórica in-game.
 * Contém informações educativas organizadas em 4 seções:
 *   - ciclos: Ciclos econômicos da história brasileira
 *   - personalidades: Figuras históricas relevantes
 *   - territorios: Informações por capitania/província
 *   - linha_do_tempo: Marcos cronológicos entre 1530-1889
 * 
 * Cada entrada possui um campo 'era' para filtrar por período jogado.
 */
export const enciclopedia = {
    ciclos: [
        {
            id: "pau_brasil",
            nome: "Ciclo do Pau-Brasil",
            periodo: "1500 – 1550",
            era: "colonial",
            icone: "🌳",
            descricao: "O primeiro ciclo econômico do Brasil. O pau-brasil (Caesalpinia echinata) era altamente valorizado na Europa para a produção de tinta vermelha para tecidos. Os portugueses estabeleceram feitorias no litoral e utilizaram mão de obra indígena por escambo para a extração. A exploração predatória quase levou à extinção da espécie.",
            impacto_mecanico: "No jogo, o pau-brasil gera renda proporcional ao nível do porto (×0.03) e estradas (×0.01) para todas as capitanias até 1550.",
            curiosidades: "O nome 'Brasil' vem da árvore, e não o contrário. Os franceses também contrabandeavam pau-brasil, gerando conflitos diplomáticos."
        },
        {
            id: "acucar",
            nome: "Ciclo do Açúcar",
            periodo: "1550 – 1700",
            era: "colonial",
            icone: "🍬",
            descricao: "O açúcar brasileiro dominou o mercado mundial por mais de um século. Os engenhos nordestinos, especialmente em Pernambuco e Bahia, tornaram-se centros de riqueza colossal. A produção dependia de mão de obra escravizada africana e de infraestrutura portuária para exportação à Europa. A concorrência holandesa e antilhana acabou por enfraquecer o monopólio brasileiro.",
            impacto_mecanico: "Capitanias nordestinas com vocação agrícola e porto ≥ 3 ganham +5% de crescimento anual do PIB. Portos abaixo de 3 geram alertas de gargalo logístico.",
            curiosidades: "Pernambuco era a capitania mais rica da colônia. A invasão holandesa (1630) visava justamente controlar os lucros do açúcar."
        },
        {
            id: "ouro",
            nome: "Ciclo do Ouro",
            periodo: "1693 – 1785",
            era: "colonial",
            icone: "✨",
            descricao: "A descoberta de ouro no interior de Minas Gerais pelos bandeirantes paulistas provocou a maior corrida do ouro da história colonial das Américas. A riqueza atraiu centenas de milhares de colonos, fundou cidades como Vila Rica (Ouro Preto), e fez do Brasil o maior produtor mundial de ouro no século XVIII. O Quinto (imposto de 20% sobre o ouro) e a Derrama geraram revoltas como a Inconfidência Mineira.",
            impacto_mecanico: "Ativado quando investimento de exploração ≥ 500 e São Vicente possui estradas ≥ 3. Concede +15% de crescimento de PIB à capitania.",
            curiosidades: "Estima-se que o Brasil produziu mais ouro que toda a extração espanhola no Peru e México juntos."
        },
        {
            id: "cafe",
            nome: "Ciclo do Café",
            periodo: "1820 – 1930",
            era: "imperio",
            icone: "☕",
            descricao: "O café tornou-se o principal produto de exportação do Brasil Imperial e da República Velha. Cultivado inicialmente no Vale do Paraíba (RJ) e expandido para o interior de São Paulo, financiou ferrovias, a imigração europeia e a industrialização. Os barões do café detinham enorme poder político, dando origem à expressão 'política do café com leite'.",
            impacto_mecanico: "Na Era Imperial, províncias do Sudeste com modal rodoviário ≥ 2 ganham +6% de crescimento anual do PIB pelo ciclo do café.",
            curiosidades: "O Brasil chegou a responder por 80% da produção mundial de café. Santos era o maior porto exportador de café do mundo."
        }
    ],

    personalidades: [
        {
            id: "tome_de_sousa",
            nome: "Tomé de Sousa",
            periodo: "1503 – 1579",
            era: "colonial",
            icone: "👑",
            cargo: "1º Governador-Geral do Brasil (1549-1553)",
            descricao: "Nobre português encarregado por D. João III de centralizar a administração colonial. Fundou a cidade de Salvador, estabeleceu o primeiro governo centralizado e trouxe os jesuítas liderados por Manuel da Nóbrega. Sob seu governo, iniciou-se a organização da justiça, da defesa e da arrecadação fiscal na colônia.",
            relacao_jogo: "Aparece no evento 'Governo-Geral (1548)'. A decisão de centralizar ou resistir define o bônus de arrecadação nacional."
        },
        {
            id: "duarte_coelho",
            nome: "Duarte Coelho Pereira",
            periodo: "c. 1485 – 1554",
            era: "colonial",
            icone: "🛡️",
            cargo: "Donatário da Capitania de Pernambuco",
            descricao: "Militar e navegador português considerado o donatário mais bem-sucedido das capitanias hereditárias. Fundou a vila de Olinda e estabeleceu os primeiros engenhos de açúcar no Nordeste, transformando Pernambuco na capitania mais próspera da colônia.",
            relacao_jogo: "Pernambuco começa o jogo com o maior PIB e nível de porto mais alto, refletindo a herança de Duarte Coelho."
        },
        {
            id: "zumbi",
            nome: "Zumbi dos Palmares",
            periodo: "1655 – 1695",
            era: "colonial",
            icone: "⚔️",
            cargo: "Último líder do Quilombo dos Palmares",
            descricao: "Líder guerreiro do maior e mais duradouro quilombo das Américas, o Quilombo dos Palmares em Alagoas/Pernambuco. Resistiu por décadas à Coroa portuguesa e aos bandeirantes. Sua morte em 20 de novembro de 1695 é lembrada como Dia da Consciência Negra.",
            relacao_jogo: "Aparece no evento 'Resistência de Palmares'. O jogador decide entre destruição militar ou tratado de autonomia."
        },
        {
            id: "tiradentes",
            nome: "Joaquim José da Silva Xavier (Tiradentes)",
            periodo: "1746 – 1792",
            era: "colonial",
            icone: "🗽",
            cargo: "Alferes e líder da Inconfidência Mineira",
            descricao: "Alferes da cavalaria, dentista prático e idealista republicano. Liderou a Inconfidência Mineira contra a cobrança da Derrama (impostos atrasados do Quinto do ouro). Foi o único conjurado condenado à morte, enforcado e esquartejado em 1792, tornando-se o mártir da independência brasileira.",
            relacao_jogo: "Aparece no evento 'Inconfidência Mineira (1789)'. A decisão sobre devassa ou perdão impacta revolta e PIB regional."
        },
        {
            id: "dom_pedro_i",
            nome: "D. Pedro I",
            periodo: "1798 – 1834",
            era: "imperio",
            icone: "🏛️",
            cargo: "1º Imperador do Brasil (1822-1831)",
            descricao: "Filho do Rei D. João VI de Portugal, proclamou a independência do Brasil em 7 de setembro de 1822 às margens do Rio Ipiranga. Outorgou a primeira Constituição em 1824 e abdicou em 1831 em favor de seu filho Pedro II, retornando a Portugal.",
            relacao_jogo: "A transição de era Colonial → Império representa o legado de D. Pedro I. A escolha entre caminho ucrônico e canônico define os rumos do novo império."
        },
        {
            id: "mauricio_nassau",
            nome: "Maurício de Nassau",
            periodo: "1604 – 1679",
            era: "colonial",
            icone: "🎨",
            cargo: "Governador do Brasil Holandês (1637-1644)",
            descricao: "Nobre neerlandês que governou o Nordeste brasileiro sob domínio holandês. Promoveu tolerância religiosa, urbanização de Recife, obras de saneamento, e patrocinou artistas como Frans Post e Albert Eckhout. Seu governo é considerado um período de florescimento cultural no Nordeste colonial.",
            relacao_jogo: "Relacionado ao evento 'Invasão Holandesa de Pernambuco (1630)'. Se o jogador capitula, Pernambuco fica sob controle holandês."
        }
    ],

    territorios: [
        {
            id: "pernambuco",
            nome: "Capitania de Pernambuco",
            fundacao: "1534",
            donatario: "Duarte Coelho Pereira",
            era: "colonial",
            descricao: "A capitania mais bem-sucedida do Brasil colonial. Centro do Ciclo do Açúcar, com dezenas de engenhos exportando para a Europa. Sofreu a invasão holandesa (1630-1654) e abrigou o Quilombo dos Palmares.",
            curiosidades: "Olinda era tão rica que os holandeses a chamavam de 'Cidade das Torres'. Tinha mais igrejas por hectare que qualquer cidade europeia."
        },
        {
            id: "bahia",
            nome: "Capitania da Baía de Todos os Santos",
            fundacao: "1534",
            donatario: "Francisco Pereira Coutinho",
            era: "colonial",
            descricao: "Sede do Governo-Geral a partir de 1549, Salvador foi a capital do Brasil por mais de dois séculos. A Bahia era o principal polo administrativo e religioso, além de importante produtora de açúcar e tabaco.",
            curiosidades: "A cidade de Salvador foi a maior das Américas durante boa parte do século XVII, superando qualquer cidade das colônias espanholas."
        },
        {
            id: "sao_vicente",
            nome: "Capitania de São Vicente",
            fundacao: "1534",
            donatario: "Martim Afonso de Sousa",
            era: "colonial",
            descricao: "Ponto de partida dos bandeirantes que expandiram as fronteiras do Brasil. Embora sem a riqueza açucareira do Nordeste, São Vicente floresceu com o comércio interior e foi o berço do Ciclo do Ouro.",
            curiosidades: "Os bandeirantes paulistas percorriam milhares de quilômetros a pé pelo interior do continente. Muitos falavam tupi como primeira língua."
        },
        {
            id: "maranhao",
            nome: "Capitania do Maranhão",
            fundacao: "1534",
            donatario: "João de Barros & Aires da Cunha",
            era: "colonial",
            descricao: "Uma das capitanias mais isoladas, com comunicação mais fácil com Lisboa do que com Salvador. Disputada por franceses, que fundaram São Luís em 1612. Importante produtora de algodão e drogas do sertão.",
            curiosidades: "O Maranhão teve uma administração separada do Brasil (Estado do Maranhão e Grão-Pará) durante boa parte do período colonial."
        },
        {
            id: "ceara",
            nome: "Capitania do Ceará",
            fundacao: "1534",
            donatario: "António Cardoso de Barros",
            era: "colonial",
            descricao: "Uma das capitanias mais difíceis de colonizar devido ao clima seco e à resistência indígena. Permaneceu subordinada a outras capitanias por longos períodos.",
            curiosidades: "O Ceará foi a primeira província brasileira a abolir a escravidão, em 1884, quatro anos antes da Lei Áurea."
        }
    ],

    linha_do_tempo: [
        { ano: 1500, titulo: "Chegada de Pedro Álvares Cabral", descricao: "A esquadra portuguesa avista o Monte Pascoal e desembarca em Porto Seguro.", tipo: "marco", era: "colonial" },
        { ano: 1530, titulo: "Início da Colonização Efetiva", descricao: "Martim Afonso de Sousa funda São Vicente, a primeira vila permanente do Brasil.", tipo: "marco", era: "colonial" },
        { ano: 1534, titulo: "Capitanias Hereditárias", descricao: "D. João III divide o litoral em 14 faixas de terra entregues a 12 donatários. É o sistema que o jogador administra.", tipo: "politico", era: "colonial" },
        { ano: 1548, titulo: "Governo-Geral", descricao: "Criação do cargo de Governador-Geral para centralizar a administração colonial. Tomé de Sousa é o primeiro.", tipo: "politico", era: "colonial" },
        { ano: 1549, titulo: "Fundação de Salvador", descricao: "Tomé de Sousa funda Salvador da Bahia, a primeira capital do Brasil.", tipo: "marco", era: "colonial" },
        { ano: 1555, titulo: "França Antártica", descricao: "Franceses estabelecem colônia na Baía de Guanabara, ameaçando o domínio português no sul.", tipo: "conflito", era: "colonial" },
        { ano: 1565, titulo: "Fundação do Rio de Janeiro", descricao: "Estácio de Sá funda São Sebastião do Rio de Janeiro após expulsar os franceses.", tipo: "marco", era: "colonial" },
        { ano: 1580, titulo: "União Ibérica", descricao: "Portugal e Espanha são unificados sob a Coroa espanhola. As fronteiras coloniais se tornam flexíveis, facilitando a expansão bandeirante.", tipo: "politico", era: "colonial" },
        { ano: 1612, titulo: "Fundação de São Luís", descricao: "Franceses da 'França Equinocial' fundam São Luís do Maranhão. Portugueses a tomam em 1615.", tipo: "marco", era: "colonial" },
        { ano: 1616, titulo: "Fundação de Belém", descricao: "Forte do Presépio é erguido para guardar a foz do Amazonas, dando origem à cidade de Belém.", tipo: "marco", era: "colonial" },
        { ano: 1624, titulo: "Invasão Holandesa de Salvador", descricao: "A WIC toma Salvador por um ano. A 'Jornada dos Vassalos' a reconquista em 1625.", tipo: "conflito", era: "colonial" },
        { ano: 1630, titulo: "Invasão Holandesa de Pernambuco", descricao: "A WIC conquista o Nordeste açucareiro. Maurício de Nassau governa Recife (1637-1644).", tipo: "conflito", era: "colonial" },
        { ano: 1654, titulo: "Expulsão dos Holandeses", descricao: "Insurreição Pernambucana (luso-brasileiros, indígenas e africanos) retoma o Nordeste para Portugal.", tipo: "conflito", era: "colonial" },
        { ano: 1670, titulo: "Quilombo dos Palmares", descricao: "O quilombo atinge seu apogeu com mais de 20 mil habitantes. Zumbi assume a liderança.", tipo: "conflito", era: "colonial" },
        { ano: 1693, titulo: "Descoberta do Ouro", descricao: "Bandeirantes encontram ouro em Minas Gerais. Começa a maior corrida do ouro da América colonial.", tipo: "economico", era: "colonial" },
        { ano: 1703, titulo: "Tratado de Methuen", descricao: "Tratado de 'Panos e Vinhos' assinado entre Portugal e Inglaterra, afetando a economia e retenção de ouro colonial.", tipo: "politico", era: "colonial" },
        { ano: 1711, titulo: "Fundação de Vila Rica", descricao: "Ouro Preto é fundada como centro administrativo do Ciclo do Ouro.", tipo: "marco", era: "colonial" },
        { ano: 1750, titulo: "Tratado de Madrid", descricao: "Acordo de fronteiras baseado no Uti possidetis que expande o território do Brasil colonial para oeste e sul.", tipo: "politico", era: "colonial" },
        { ano: 1763, titulo: "Capital Transferida para o Rio", descricao: "A capital da colônia é transferida de Salvador para o Rio de Janeiro, refletindo a importância do ouro mineiro.", tipo: "politico", era: "colonial" },
        { ano: 1789, titulo: "Inconfidência Mineira", descricao: "Conspiração republicana em Vila Rica liderada por Tiradentes. A derrama e o declínio do ouro motivam a revolta.", tipo: "conflito", era: "colonial" },
        { ano: 1808, titulo: "Corte Portuguesa no Brasil", descricao: "Fugindo de Napoleão, a família real portuguesa se instala no Rio de Janeiro. O Brasil é elevado a Reino Unido.", tipo: "politico", era: "colonial" },
        { ano: 1817, titulo: "Revolução Pernambucana", descricao: "Movimento republicano e emancipacionista em Recife contra os pesados impostos da Corte no Rio de Janeiro.", tipo: "conflito", era: "colonial" },
        { ano: 1822, titulo: "Independência do Brasil", descricao: "D. Pedro I proclama a independência em 7 de setembro às margens do Ipiranga. Nasce o Império do Brasil.", tipo: "marco", era: "colonial" },
        { ano: 1824, titulo: "Primeira Constituição", descricao: "D. Pedro I outorga a Constituição de 1824, com Poder Moderador exclusivo do Imperador.", tipo: "politico", era: "imperio" },
        { ano: 1831, titulo: "Abdicação de D. Pedro I", descricao: "D. Pedro I abdica em favor de seu filho Pedro, de 5 anos. Inicia o Período Regencial.", tipo: "politico", era: "imperio" },
        { ano: 1835, titulo: "Revolta dos Farrapos", descricao: "Maior revolta do período imperial. O Rio Grande do Sul declara a República Rio-Grandense.", tipo: "conflito", era: "imperio" },
        { ano: 1840, titulo: "Golpe da Maioridade", descricao: "D. Pedro II assume o trono aos 14 anos para encerrar a instabilidade regencial.", tipo: "politico", era: "imperio" },
        { ano: 1850, titulo: "Lei Eusébio de Queirós", descricao: "Proíbe o tráfico transatlântico de escravizados, impactando a economia cafeeira.", tipo: "politico", era: "imperio" },
        { ano: 1864, titulo: "Guerra do Paraguai", descricao: "Maior conflito armado da América do Sul. Brasil, Argentina e Uruguai lutam contra o Paraguai.", tipo: "conflito", era: "imperio" },
        { ano: 1888, titulo: "Lei Áurea", descricao: "Princesa Isabel assina a abolição da escravidão, libertando os últimos 700 mil escravizados.", tipo: "politico", era: "imperio" },
        { ano: 1889, titulo: "Proclamação da República", descricao: "Marechal Deodoro proclama a República. D. Pedro II é exilado para a Europa.", tipo: "marco", era: "imperio" }
    ]
};
