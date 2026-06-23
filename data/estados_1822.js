/**
 * estados_1822.js
 * 
 * Fonte da Verdade histórica para a Era do Império do Brasil (1822).
 * Contém dados calibrados das 19 províncias imperiais para o ano de início de 1822.
 * 
 * Estrutura compatível com o GameState para garantir funcionamento unificado da Engine.
 */

export const estados1822 = [
    {
        id: "grao_para",
        nome: "Província do Grão-Pará",
        donatario: "Presidente de Província",
        regiao: "norte",
        demografia: {
            populacao_total: 120,
            nivel_satisfacao: 55
        },
        economia: {
            pib_total: 25.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.14,
            retencao_uniao: 0.60,
            repasse_estado: 0.40
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
        id: "maranhao",
        nome: "Província do Maranhão",
        donatario: "Presidente de Província",
        regiao: "norte",
        demografia: {
            populacao_total: 160,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 35.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.15,
            retencao_uniao: 0.65,
            repasse_estado: 0.35
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
        id: "piaui",
        nome: "Província do Piauí",
        donatario: "Presidente de Província",
        regiao: "norte",
        demografia: {
            populacao_total: 90,
            nivel_satisfacao: 58
        },
        economia: {
            pib_total: 15.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.10,
            retencao_uniao: 0.60,
            repasse_estado: 0.40
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
        nome: "Província do Ceará",
        donatario: "Presidente de Província",
        regiao: "norte",
        demografia: {
            populacao_total: 110,
            nivel_satisfacao: 55
        },
        economia: {
            pib_total: 22.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.60,
            repasse_estado: 0.40
        },
        infraestrutura: {
            modal_portuario: 1,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 18
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "rio_grande_do_norte",
        nome: "Província do Rio Grande do Norte",
        donatario: "Presidente de Província",
        regiao: "nordeste",
        demografia: {
            populacao_total: 95,
            nivel_satisfacao: 62
        },
        economia: {
            pib_total: 20.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.65,
            repasse_estado: 0.35
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
        id: "paraiba",
        nome: "Província da Paraíba",
        donatario: "Presidente de Província",
        regiao: "nordeste",
        demografia: {
            populacao_total: 130,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 30.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.14,
            retencao_uniao: 0.65,
            repasse_estado: 0.35
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
        nome: "Província de Pernambuco",
        donatario: "Presidente de Província",
        regiao: "nordeste",
        demografia: {
            populacao_total: 360,
            nivel_satisfacao: 50
        },
        economia: {
            pib_total: 100.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.18,
            retencao_uniao: 0.70,
            repasse_estado: 0.30
        },
        infraestrutura: {
            modal_portuario: 3,
            modal_rodoviario: 2
        },
        defesa: {
            milicia_local: 2,
            indice_revolta: 30
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "alagoas",
        nome: "Província de Alagoas",
        donatario: "Presidente de Província",
        regiao: "nordeste",
        demografia: {
            populacao_total: 110,
            nivel_satisfacao: 58
        },
        economia: {
            pib_total: 25.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.14,
            retencao_uniao: 0.65,
            repasse_estado: 0.35
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
        id: "sergipe",
        nome: "Província de Sergipe",
        donatario: "Presidente de Província",
        regiao: "nordeste",
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
            retencao_uniao: 0.65,
            repasse_estado: 0.35
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
        id: "bahia",
        nome: "Província da Bahia",
        donatario: "Presidente de Província",
        regiao: "nordeste",
        demografia: {
            populacao_total: 390,
            nivel_satisfacao: 52
        },
        economia: {
            pib_total: 110.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.18,
            retencao_uniao: 0.70,
            repasse_estado: 0.30
        },
        infraestrutura: {
            modal_portuario: 3,
            modal_rodoviario: 2
        },
        defesa: {
            milicia_local: 2,
            indice_revolta: 25
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "espirito_santo",
        nome: "Província do Espírito Santo",
        donatario: "Presidente de Província",
        regiao: "leste",
        demografia: {
            populacao_total: 120,
            nivel_satisfacao: 65
        },
        economia: {
            pib_total: 30.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.60,
            repasse_estado: 0.40
        },
        infraestrutura: {
            modal_portuario: 2,
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
        id: "rio_de_janeiro",
        nome: "Província do Rio de Janeiro",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 480,
            nivel_satisfacao: 70
        },
        economia: {
            pib_total: 150.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.22,
            retencao_uniao: 0.75,
            repasse_estado: 0.25
        },
        infraestrutura: {
            modal_portuario: 4,
            modal_rodoviario: 2
        },
        defesa: {
            milicia_local: 3,
            indice_revolta: 8
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "sao_paulo",
        nome: "Província de São Paulo",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 290,
            nivel_satisfacao: 65
        },
        economia: {
            pib_total: 80.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.16,
            retencao_uniao: 0.68,
            repasse_estado: 0.32
        },
        infraestrutura: {
            modal_portuario: 2,
            modal_rodoviario: 2
        },
        defesa: {
            milicia_local: 2,
            indice_revolta: 12
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "minas_gerais",
        nome: "Província de Minas Gerais",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 450,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 130.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.18,
            retencao_uniao: 0.72,
            repasse_estado: 0.28
        },
        infraestrutura: {
            modal_portuario: 0,
            modal_rodoviario: 2
        },
        defesa: {
            milicia_local: 2,
            indice_revolta: 15
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "goias",
        nome: "Província de Goiás",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 95,
            nivel_satisfacao: 58
        },
        economia: {
            pib_total: 25.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.60,
            repasse_estado: 0.40
        },
        infraestrutura: {
            modal_portuario: 0,
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
        id: "mato_grosso",
        nome: "Província de Mato Grosso",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 80,
            nivel_satisfacao: 55
        },
        economia: {
            pib_total: 20.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.10,
            retencao_uniao: 0.60,
            repasse_estado: 0.40
        },
        infraestrutura: {
            modal_portuario: 0,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 18
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    },
    {
        id: "santa_catarina",
        nome: "Província de Santa Catarina",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 75,
            nivel_satisfacao: 65
        },
        economia: {
            pib_total: 20.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: true
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.60,
            repasse_estado: 0.40
        },
        infraestrutura: {
            modal_portuario: 2,
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
        id: "rio_grande_do_sul",
        nome: "Província de São Pedro do Rio Grande do Sul",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 160,
            nivel_satisfacao: 60
        },
        economia: {
            pib_total: 45.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.14,
            retencao_uniao: 0.65,
            repasse_estado: 0.35
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
        id: "cisplatina",
        nome: "Província da Cisplatina",
        donatario: "Presidente de Província",
        regiao: "sudeste",
        demografia: {
            populacao_total: 80,
            nivel_satisfacao: 45
        },
        economia: {
            pib_total: 20.0,
            arrecadacao_bruta: 0.0,
            vocacao_agricola: false
        },
        pacto_federativo: {
            aliquota_imposto: 0.12,
            retencao_uniao: 0.70,
            repasse_estado: 0.30
        },
        infraestrutura: {
            modal_portuario: 2,
            modal_rodoviario: 1
        },
        defesa: {
            milicia_local: 1,
            indice_revolta: 45
        },
        status_territorio: "controlado",
        invadido_por: null,
        duracao_invasao: 0
    }
];
