/**
 * provincia_mapping.js
 * 
 * Matriz de mapeamento territorial para transições de Eras.
 * Define como as capitanias coloniais (12) se fundem/dividem
 * para formar as províncias imperiais de 1822 (19).
 * 
 * Os pesos indicam a fração de herança econômica/demográfica
 * que cada província de destino recebe da capitania de origem.
 */

export const transicaoMapeamento = {
    colonia_para_imperio: {
        grao_para: {
            fontes: { maranhao: 0.4 },
            base_pib: 25.0,
            base_pop: 110
        },
        maranhao: {
            fontes: { maranhao: 0.6 },
            base_pib: 35.0,
            base_pop: 150
        },
        piaui: {
            fontes: { maranhao: 0.1, ceara: 0.3 },
            base_pib: 15.0,
            base_pop: 80
        },
        ceara: {
            fontes: { ceara: 0.7 },
            base_pib: 22.0,
            base_pop: 100
        },
        rio_grande_do_norte: {
            fontes: { rio_grande: 0.7 },
            base_pib: 20.0,
            base_pop: 90
        },
        paraiba: {
            fontes: { rio_grande: 0.3, itamaraca: 0.5 },
            base_pib: 30.0,
            base_pop: 130
        },
        pernambuco: {
            fontes: { itamaraca: 0.5, pernambuco: 0.7 },
            base_pib: 100.0,
            base_pop: 350
        },
        alagoas: {
            fontes: { pernambuco: 0.2 },
            base_pib: 25.0,
            base_pop: 100
        },
        sergipe: {
            fontes: { pernambuco: 0.1, bahia: 0.2 },
            base_pib: 20.0,
            base_pop: 90
        },
        bahia: {
            fontes: { bahia: 0.8, ilheos: 0.6 },
            base_pib: 110.0,
            base_pop: 380
        },
        espirito_santo: {
            fontes: { porto_seguro: 0.4, espirito_santo: 0.8 },
            base_pib: 30.0,
            base_pop: 120
        },
        rio_de_janeiro: {
            fontes: { sao_tome: 1.0, porto_seguro: 0.2 },
            base_pib: 150.0,
            base_pop: 450
        },
        sao_paulo: {
            fontes: { sao_vicente: 0.5, santo_amaro: 0.5 },
            base_pib: 80.0,
            base_pop: 280
        },
        minas_gerais: {
            fontes: { sao_vicente: 0.3 },
            base_pib: 130.0,
            base_pop: 420
        },
        goias: {
            fontes: { sao_vicente: 0.1 },
            base_pib: 25.0,
            base_pop: 90
        },
        mato_grosso: {
            fontes: { sao_vicente: 0.1 },
            base_pib: 20.0,
            base_pop: 80
        },
        santa_catarina: {
            fontes: { sao_vicente: 0.1, santo_amaro: 0.2 },
            base_pib: 20.0,
            base_pop: 70
        },
        rio_grande_do_sul: {
            fontes: { sao_vicente: 0.1 },
            base_pib: 45.0,
            base_pop: 160
        },
        cisplatina: {
            fontes: {},
            base_pib: 20.0,
            base_pop: 80
        }
    }
};
