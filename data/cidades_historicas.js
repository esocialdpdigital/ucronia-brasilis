/**
 * cidades_historicas.js
 * 
 * Dados declarativos das principais cidades fundadas ao longo da história colonial e imperial.
 * Cada cidade possui coordenadas no sistema GeoJSON [longitude, latitude] para projeção D3.
 * O campo ano_fundacao determina quando o ícone surge no mapa.
 */
export const cidadesHistoricas = [
    {
        id: "sao_vicente_cidade",
        nome: "São Vicente",
        ano_fundacao: 1532,
        coords: [-46.39, -23.96],
        descricao: "Primeira vila permanente do Brasil, fundada por Martim Afonso de Sousa. Ponto de partida das expedições bandeirantes.",
        era: "colonial"
    },
    {
        id: "olinda",
        nome: "Olinda",
        ano_fundacao: 1535,
        coords: [-34.85, -8.01],
        descricao: "Capital da próspera Capitania de Pernambuco, centro do Ciclo do Açúcar. Saqueada e incendiada pelos holandeses em 1631.",
        era: "colonial"
    },
    {
        id: "salvador",
        nome: "Salvador",
        ano_fundacao: 1549,
        coords: [-38.51, -12.97],
        descricao: "Primeira capital do Brasil, sede do Governo-Geral de Tomé de Sousa. Centro administrativo e comercial da colônia por mais de dois séculos.",
        era: "colonial"
    },
    {
        id: "sao_paulo",
        nome: "São Paulo",
        ano_fundacao: 1554,
        coords: [-46.63, -23.55],
        descricao: "Fundada por jesuítas no planalto de Piratininga. Tornou-se o polo de partida dos bandeirantes em direção ao interior.",
        era: "colonial"
    },
    {
        id: "rio_de_janeiro",
        nome: "Rio de Janeiro",
        ano_fundacao: 1565,
        coords: [-43.18, -22.90],
        descricao: "Fundada por Estácio de Sá após a expulsão dos franceses da Baía de Guanabara. Tornou-se capital da colônia em 1763.",
        era: "colonial"
    },
    {
        id: "natal",
        nome: "Natal",
        ano_fundacao: 1599,
        coords: [-35.20, -5.79],
        descricao: "Fundada ao redor do Forte dos Reis Magos para proteger a costa nordeste contra corsários franceses.",
        era: "colonial"
    },
    {
        id: "sao_luis",
        nome: "São Luís",
        ano_fundacao: 1612,
        coords: [-44.30, -2.53],
        descricao: "Fundada pelos franceses da França Equinocial, tomada pelos portugueses em 1615. Uma das poucas capitais brasileiras fundada por europeus não-portugueses.",
        era: "colonial"
    },
    {
        id: "belem",
        nome: "Belém",
        ano_fundacao: 1616,
        coords: [-48.50, -1.45],
        descricao: "Fundada como Feliz Lusitânia para guardar a entrada da Amazônia. Porto vital para o comércio de drogas do sertão e especiarias.",
        era: "colonial"
    },
    {
        id: "recife",
        nome: "Recife",
        ano_fundacao: 1637,
        coords: [-34.88, -8.05],
        descricao: "Elevada a capital durante o domínio holandês de Maurício de Nassau. Centro de um florescente período cultural e urbanístico sob os batavos.",
        era: "colonial"
    },
    {
        id: "ouro_preto",
        nome: "Ouro Preto (Vila Rica)",
        ano_fundacao: 1711,
        coords: [-43.50, -20.38],
        descricao: "Centro do Ciclo do Ouro colonial e palco da Inconfidência Mineira de 1789. Suas igrejas barrocas são Patrimônio da Humanidade.",
        era: "colonial"
    },
    {
        id: "fortaleza",
        nome: "Fortaleza",
        ano_fundacao: 1726,
        coords: [-38.54, -3.72],
        descricao: "Elevada a vila pela Coroa portuguesa em 1726. Cresceu como porto estratégico do Ceará.",
        era: "colonial"
    },
    {
        id: "cuiaba",
        nome: "Cuiabá",
        ano_fundacao: 1727,
        coords: [-56.10, -15.60],
        descricao: "Fundada durante a febre do ouro no interior do Brasil. Ponto mais ocidental de penetração dos bandeirantes paulistas.",
        era: "colonial"
    },
    {
        id: "porto_alegre",
        nome: "Porto Alegre",
        ano_fundacao: 1772,
        coords: [-51.22, -30.03],
        descricao: "Fundada por casais açorianos para consolidar a presença portuguesa no extremo sul da colônia, disputado com a Espanha.",
        era: "colonial"
    }
];

export const rotasHistoricas = [
    { de: "sao_vicente_cidade", para: "sao_paulo", ano: 1554, tipo: "terrestre" }, // Caminho do Padre José de Anchieta
    { de: "sao_vicente_cidade", para: "rio_de_janeiro", ano: 1565, tipo: "maritima" },
    { de: "rio_de_janeiro", para: "ouro_preto", ano: 1711, tipo: "terrestre" }, // Caminho Novo
    { de: "salvador", para: "olinda", ano: 1549, tipo: "maritima" },
    { de: "olinda", para: "recife", ano: 1637, tipo: "terrestre" },
    { de: "olinda", para: "natal", ano: 1599, tipo: "maritima" },
    { de: "natal", para: "fortaleza", ano: 1726, tipo: "maritima" },
    { de: "fortaleza", para: "sao_luis", ano: 1726, tipo: "maritima" },
    { de: "sao_luis", para: "belem", ano: 1616, tipo: "maritima" },
    { de: "sao_paulo", para: "cuiaba", ano: 1727, tipo: "terrestre" }, // Caminhos bandeirantes
    { de: "sao_paulo", para: "porto_alegre", ano: 1772, tipo: "terrestre" } // Caminho do Viamão / Tropas
];
