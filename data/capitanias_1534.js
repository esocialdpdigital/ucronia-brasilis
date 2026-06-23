/**
 * capitanias_1534.js
 *
 * Fonte da Verdade histórica para as Capitanias Hereditárias do Brasil Colonial.
 * Dados calibrados para o estado inicial da simulação (Ano 1530-1534).
 * 
 * Referência histórica: D. João III distribuiu 14 capitanias a 12 donatários
 * a partir de 1534. Aqui são representadas como 12 entidades jogáveis
 * (Maranhão 1+2 unificados; Santo Amaro e Santana unificadas).
 *
 * Campos extras informativos (não usados pela engine, apenas para UI/lore):
 *   - donatario: Nome do donatário histórico
 *   - regiao: Agrupamento geográfico para o painel de filtro
 */
export const capitaniasIniciais = [
    {
        id: "maranhao",
        nome: "Capitania do Maranhão",
        donatario: "João de Barros & Aires da Cunha",
        regiao: "norte",
        demografia: {
            populacao_total: 180,
            nivel_satisfacao: 55
        },
        economia: {
            pib_total: 30.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.15,
            retencao_uniao: 0.80,
            repasse_estado: 0.20
        },
        infraestrutura: {
            modal_portuario: 1,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 15
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "ceara",
        nome: "Capitania do Ceará",
        donatario: "António Cardoso de Barros",
        regiao: "norte",
        demografia: {
            populacao_total: 120,
            nivel_satisfacao: 50
        },
        economia: {
            pib_total: 20.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.75,
            repasse_estado: 0.25
        },
        infraestrutura: {
            modal_portuario: 1,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 20
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "rio_grande",
        nome: "Capitania do Rio Grande",
        donatario: "João de Barros & Aires da Cunha",
        regiao: "nordeste",
        demografia: {
            populacao_total: 140,
            nivel_satisfacao: 55
        },
        economia: {
            pib_total: 25.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.13,
            retencao_uniao: 0.78,
            repasse_estado: 0.22
        },
        infraestrutura: {
            modal_portuario: 1,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 20
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "itamaraca",
        nome: "Capitania de Itamaracá",
        donatario: "Pero Lopes de Sousa",
        regiao: "nordeste",
        demografia: {
            populacao_total: 200,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 45.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.18,
            retencao_uniao: 0.78,
            repasse_estado: 0.22
        },
        infraestrutura: {
            modal_portuario: 2,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 15
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "pernambuco",
        nome: "Capitania de Pernambuco",
        donatario: "Duarte Coelho",
        regiao: "nordeste",
        demografia: {
            populacao_total: 400,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 120.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.20,
            retencao_uniao: 0.80,
            repasse_estado: 0.20
        },
        infraestrutura: {
            modal_portuario: 3,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 10
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "bahia",
        nome: "Capitania da Baía de Todos os Santos",
        donatario: "Francisco Pereira Coutinho",
        regiao: "nordeste",
        demografia: {
            populacao_total: 300,
            nivel_satisfacao: 65
        },
        economia: {
            pib_total: 90.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.25,
            retencao_uniao: 0.85,
            repasse_estado: 0.15
        },
        infraestrutura: {
            modal_portuario: 4,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 20
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "ilheos",
        nome: "Capitania de Ilhéus",
        donatario: "Jorge de Figueiredo Correia",
        regiao: "leste",
        demografia: {
            populacao_total: 160,
            nivel_satisfacao: 55
        },
        economia: {
            pib_total: 40.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.17,
            retencao_uniao: 0.80,
            repasse_estado: 0.20
        },
        infraestrutura: {
            modal_portuario: 2,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 25
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "porto_seguro",
        nome: "Capitania de Porto Seguro",
        donatario: "Pero do Campo Tourinho",
        regiao: "leste",
        demografia: {
            populacao_total: 140,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 35.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.15,
            retencao_uniao: 0.78,
            repasse_estado: 0.22
        },
        infraestrutura: {
            modal_portuario: 2,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 20
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "espirito_santo",
        nome: "Capitania do Espírito Santo",
        donatario: "Vasco Fernandes Coutinho",
        regiao: "leste",
        demografia: {
            populacao_total: 130,
            nivel_satisfacao: 58
        },
        economia: {
            pib_total: 30.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.15,
            retencao_uniao: 0.78,
            repasse_estado: 0.22
        },
        infraestrutura: {
            modal_portuario: 2,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 15
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "sao_tome",
        nome: "Capitania de São Tomé",
        donatario: "Pero de Góis da Silveira",
        regiao: "sudeste",
        demografia: {
            populacao_total: 110,
            nivel_satisfacao: 55
        },
        economia: {
            pib_total: 25.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.13,
            retencao_uniao: 0.75,
            repasse_estado: 0.25
        },
        infraestrutura: {
            modal_portuario: 1,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 20
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "sao_vicente",
        nome: "Capitania de São Vicente",
        donatario: "Martim Afonso de Sousa",
        regiao: "sudeste",
        demografia: {
            populacao_total: 250,
            nivel_satisfacao: 70
        },
        economia: {
            pib_total: 60.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.15,
            retencao_uniao: 0.70,
            repasse_estado: 0.30
        },
        infraestrutura: {
            modal_portuario: 2,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 5
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "santo_amaro",
        nome: "Capitania de Santo Amaro e Santana",
        donatario: "Pero Lopes de Sousa",
        regiao: "sudeste",
        demografia: {
            populacao_total: 90,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 20.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.75,
            repasse_estado: 0.25
        },
        infraestrutura: {
            modal_portuario: 1,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 15
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    }
];
