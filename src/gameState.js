/**
 * gameState.js
 * 
 * Este módulo define a estrutura inicial do Estado do jogo (Data-Driven).
 * Seguindo as premissas do GDD (Clean Architecture e serialização), 
 * o estado é um objeto puramente estrutural, sem regras lógicas embutidas.
 *
 * Os dados históricos das capitanias são importados de data/capitanias_1534.js,
 * respeitando o princípio de desacoplamento total do GDD.
 * 
 * Adiciona suporte ao Sistema de Eras e fábrica de transições.
 */
import { capitaniasIniciais } from '../data/capitanias_1534.js';
import { estados1822 } from '../data/estados_1822.js';
import { transicaoMapeamento } from '../data/provincia_mapping.js';

/**
 * Retorna o estado inicial (fotografia do ano 1530)
 * @returns {Object} JSON representando o Estado Global e Entidades Regionais
 */
export function getInitialGameState(sede = "bahia", perfil = "comerciante") {
    const state = {
        // Dados Globais (União/Coroa)
        globais: {
            ano_atual: 1530,
            tesouro_nacional: 500.0, // Moeda base do jogo: Contos de Réis
            inflacao: 0.05, // 5% ao ano de inflação base
            investimento_exploracao: 0,
            bandeiras_financiadas: false, // Controla uso único do botão Financiar Bandeiras
            alertas_conselho: [],
            historico_alertas: [], // Registro histórico de alertas já gerados/exibidos
            eventos_ocorridos: {}, // Rastreia quais eventos já dispararam na simulação
            eventos_pendentes_bifurcacao: [],
            penalidades_ativas: [],
            config_ui: { exibir_popup_conselho: true, estilo_layout: "historico" },
            era_atual: "colonial", // Controla o ciclo e estética atual do jogo
            fim_da_era: false,      // Bloqueia avanço de turnos e abre modal de transição
            historico_jogador: [],         // Array de snapshots para o painel de divergência
            decisoes_historicas: [],       // Array de decisões tomadas em eventos de bifurcação
            divergencia_atual: 0.0,         // Índice de divergência atual (0 a 100)
            eventLog: [],                   // Diário de Bordo para auditar as jogadas
            settings: {
                audioEnabled: true
            },
            capitania_sede: sede,           // Salva a capitania sede escolhida
            perfil_governante: perfil       // Salva o perfil do governante escolhido
        },
        
        // Coleção de Entidades Regionais (12 Capitanias Hereditárias de 1534)
        estados: JSON.parse(JSON.stringify(capitaniasIniciais))
    };

    // --- APLICAÇÃO DOS BÔNUS DE CAPITANIA SEDE ---
    if (sede === "bahia") {
        state.globais.tesouro_nacional += 50.0; // +50 Contos
        const bahia = state.estados.find(e => e.id === "bahia");
        if (bahia) {
            bahia.defesa.milicia_local = 2; // Começa com Nível 2
        }
    } else if (sede === "pernambuco") {
        const pernambuco = state.estados.find(e => e.id === "pernambuco");
        if (pernambuco) {
            pernambuco.infraestrutura.modal_portuario = 3; // Porto Nível 3
            pernambuco.economia.vocacao_agricola = true;
        }
    } else if (sede === "sao_vicente") {
        state.globais.investimento_exploracao = 150; // +150 Exploração inicial
        const sao_vicente = state.estados.find(e => e.id === "sao_vicente");
        if (sao_vicente) {
            sao_vicente.infraestrutura.modal_rodoviario = 2; // Estrada Nível 2
        }
    }

    // --- APLICAÇÃO DOS BÔNUS/PENALIDADES DE PERFIL ---
    if (perfil === "comerciante") {
        state.globais.perfil_comerciante = true;
        state.estados.forEach(e => {
            e.defesa.indice_revolta = Math.min(100, e.defesa.indice_revolta + 5); // +5% de revolta inicial
        });
    } else if (perfil === "jesuita") {
        state.globais.perfil_jesuita = true;
        state.estados.forEach(e => {
            e.defesa.indice_revolta = Math.max(0, e.defesa.indice_revolta - 10); // -10% de revolta inicial
        });
    } else if (perfil === "militar") {
        state.globais.perfil_militar = true;
    }

    return state;
}

/**
 * Realiza a transição de era do estado do jogo.
 * @param {Object} previousState Estado final da era anterior
 * @param {string} eraDestino Nome da era de destino (ex: "imperio")
 * @param {string} tipoTransicao "ucronica" (herda riqueza) ou "canonica" (dados reais)
 * @returns {Object} Novo estado do jogo inicializado na era destino
 */
export function transitionToEra(previousState, eraDestino, tipoTransicao) {
    if (eraDestino === "imperio") {
        const novoEstado = {
            globais: {
                ano_atual: 1822,
                tesouro_nacional: tipoTransicao === "ucronica" ? previousState.globais.tesouro_nacional : 300.0,
                inflacao: tipoTransicao === "ucronica" ? previousState.globais.inflacao : 0.08,
                investimento_exploracao: 0,
                bandeiras_financiadas: false, // Reseta para nova era
                alertas_conselho: [],
                historico_alertas: JSON.parse(JSON.stringify(previousState.globais.historico_alertas || [])),
                eventos_ocorridos: JSON.parse(JSON.stringify(previousState.globais.eventos_ocorridos || {})),
                bonus_arrecadacao: previousState.globais.bonus_arrecadacao || 0,
                eventos_pendentes_bifurcacao: [],
                penalidades_ativas: [],
                config_ui: JSON.parse(JSON.stringify(previousState.globais.config_ui || { exibir_popup_conselho: true })),
                era_atual: "imperio",
                fim_da_era: false,
                historico_jogador: tipoTransicao === "ucronica" ? JSON.parse(JSON.stringify(previousState.globais.historico_jogador || [])) : [],
                decisoes_historicas: tipoTransicao === "ucronica" ? JSON.parse(JSON.stringify(previousState.globais.decisoes_historicas || [])) : [],
                divergencia_atual: tipoTransicao === "ucronica" ? (previousState.globais.divergencia_atual || 0.0) : 0.0,
                eventLog: JSON.parse(JSON.stringify(previousState.globais.eventLog || [])),
                settings: JSON.parse(JSON.stringify(previousState.globais.settings || { audioEnabled: true }))
            },
            estados: []
        };

        if (tipoTransicao === "canonica") {
            novoEstado.estados = JSON.parse(JSON.stringify(estados1822));
        } else {
            // Transição Ucrônica: calcula baseado nas fontes e pesos do mapeamento
            const mapeamento = transicaoMapeamento.colonia_para_imperio;
            const estadosAnteriores = previousState.estados;

            estados1822.forEach(provTemplate => {
                const provNova = JSON.parse(JSON.stringify(provTemplate));
                const mapaProv = mapeamento[provNova.id];

                if (mapaProv && Object.keys(mapaProv.fontes).length > 0) {
                    let pibExtra = 0;
                    let popExtra = 0;
                    let maxPorto = provNova.infraestrutura.modal_portuario;
                    let maxEstrada = provNova.infraestrutura.modal_rodoviario;
                    let maxMilicia = provNova.defesa.milicia_local;
                    let sumRevolta = 0;
                    let countFontes = 0;

                    for (const [capId, peso] of Object.entries(mapaProv.fontes)) {
                        const capAntiga = estadosAnteriores.find(e => e.id === capId);
                        if (capAntiga) {
                            pibExtra += capAntiga.economia.pib_total * peso;
                            popExtra += capAntiga.demografia.populacao_total * peso;
                            maxPorto = Math.max(maxPorto, capAntiga.infraestrutura.modal_portuario);
                            maxEstrada = Math.max(maxEstrada, capAntiga.infraestrutura.modal_rodoviario);
                            maxMilicia = Math.max(maxMilicia, capAntiga.defesa.milicia_local);
                            sumRevolta += capAntiga.defesa.indice_revolta;
                            countFontes++;
                        }
                    }

                    // PIB e População finais herdados + bases
                    provNova.economia.pib_total = Math.round((mapaProv.base_pib + pibExtra) * 10) / 10;
                    provNova.demografia.populacao_total = Math.round(mapaProv.base_pop + popExtra);
                    
                    // Recompensas de infraestrutura e defesa (mantém os níveis máximos alcançados)
                    provNova.infraestrutura.modal_portuario = maxPorto;
                    provNova.infraestrutura.modal_rodoviario = maxEstrada;
                    provNova.defesa.milicia_local = maxMilicia;
                    
                    if (countFontes > 0) {
                        provNova.defesa.indice_revolta = Math.round(sumRevolta / countFontes);
                    }
                }
                
                novoEstado.estados.push(provNova);
            });

            // Aplica os modificadores cumulativos ucrônicos se o jogador resistiu à União Ibérica
            const escolheuResistir = previousState.globais.decisoes_historicas && 
                previousState.globais.decisoes_historicas.some(d => d.evento_id === "uniao_iberica_1580" && d.opcao_escolhida === "resistir_uniao");

            if (escolheuResistir) {
                // 1. Tesouro extra +150 Contos
                novoEstado.globais.tesouro_nacional += 150.0;
                
                // 2. PIB extra +10% em PE/BA/RJ e revolta nacional -10%
                novoEstado.estados.forEach(prov => {
                    if (["pernambuco", "bahia", "rio_de_janeiro"].includes(prov.id)) {
                        prov.economia.pib_total = Math.round(prov.economia.pib_total * 1.10 * 10) / 10;
                    }
                    prov.defesa.indice_revolta = Math.max(0, prov.defesa.indice_revolta - 10);
                });
            }
        }

        return novoEstado;
    }

    // === ERA REPÚBLICA ===
    if (eraDestino === "republica") {
        // Herda os dados de estados_1822 como base, mas aplica modificadores republicanos
        const novoEstado = {
            globais: {
                ano_atual: 1823, // 1 ano após o caos de 1822
                tesouro_nacional: previousState.globais.tesouro_nacional, // Herda o tesouro (sem corte canônico)
                inflacao: previousState.globais.inflacao || 0.07,
                investimento_exploracao: 0,
                bandeiras_financiadas: false,
                alertas_conselho: [],
                historico_alertas: JSON.parse(JSON.stringify(previousState.globais.historico_alertas || [])),
                eventos_ocorridos: JSON.parse(JSON.stringify(previousState.globais.eventos_ocorridos || {})),
                bonus_arrecadacao: previousState.globais.bonus_arrecadacao || 0,
                eventos_pendentes_bifurcacao: [],
                penalidades_ativas: [],
                config_ui: JSON.parse(JSON.stringify(previousState.globais.config_ui || { exibir_popup_conselho: true })),
                era_atual: "republica",
                forma_governo: "republicana",    // Flag que controla mecânicas especiais da engine
                fim_da_era: false,
                historico_jogador: JSON.parse(JSON.stringify(previousState.globais.historico_jogador || [])),
                decisoes_historicas: JSON.parse(JSON.stringify(previousState.globais.decisoes_historicas || [])),
                divergencia_atual: previousState.globais.divergencia_atual || 0.0,
                eventLog: JSON.parse(JSON.stringify(previousState.globais.eventLog || [])),
                settings: JSON.parse(JSON.stringify(previousState.globais.settings || { audioEnabled: true }))
            },
            estados: []
        };

        // Usa os estados de 1822 como template, com modificadores de autonomia republicana
        const mapeamento = transicaoMapeamento.colonia_para_imperio;
        const estadosAnteriores = previousState.estados;

        estados1822.forEach(provTemplate => {
            const provNova = JSON.parse(JSON.stringify(provTemplate));
            const mapaProv = mapeamento[provNova.id];

            // Herda infraestrutura do jogador (mesma lógica ucrônica do Império)
            if (mapaProv && Object.keys(mapaProv.fontes).length > 0) {
                let pibExtra = 0;
                let popExtra = 0;
                let maxPorto = provNova.infraestrutura.modal_portuario;
                let maxEstrada = provNova.infraestrutura.modal_rodoviario;
                let maxMilicia = provNova.defesa.milicia_local;
                let sumRevolta = 0;
                let countFontes = 0;

                for (const [capId, peso] of Object.entries(mapaProv.fontes)) {
                    const capAntiga = estadosAnteriores.find(e => e.id === capId);
                    if (capAntiga) {
                        pibExtra += capAntiga.economia.pib_total * peso;
                        popExtra += capAntiga.demografia.populacao_total * peso;
                        maxPorto = Math.max(maxPorto, capAntiga.infraestrutura.modal_portuario);
                        maxEstrada = Math.max(maxEstrada, capAntiga.infraestrutura.modal_rodoviario);
                        maxMilicia = Math.max(maxMilicia, capAntiga.defesa.milicia_local);
                        sumRevolta += capAntiga.defesa.indice_revolta;
                        countFontes++;
                    }
                }

                provNova.economia.pib_total = Math.round((mapaProv.base_pib + pibExtra) * 10) / 10;
                provNova.demografia.populacao_total = Math.round(mapaProv.base_pop + popExtra);
                provNova.infraestrutura.modal_portuario = maxPorto;
                provNova.infraestrutura.modal_rodoviario = maxEstrada;
                provNova.defesa.milicia_local = maxMilicia;
                if (countFontes > 0) {
                    provNova.defesa.indice_revolta = Math.round(sumRevolta / countFontes);
                }
            }

            // === MODIFICADORES REPUBLICANOS ===
            // Províncias retêm mais receita (autonomia fiscal da República Confederada)
            provNova.pacto_federativo.retencao_uniao = Math.max(0.35, (provNova.pacto_federativo.retencao_uniao || 0.60) - 0.15);
            provNova.pacto_federativo.repasse_estado = 1.0 - provNova.pacto_federativo.retencao_uniao;

            novoEstado.estados.push(provNova);
        });

        novoEstado.globais.eventLog.push({
            ano: 1822,
            tipo: "independencia",
            texto: "🗳️ REPÚBLICA CONFEDERADA DO BRASIL PROCLAMADA! As províncias assumem sua autonomia. O caminho da história foi alterado para sempre."
        });

        return novoEstado;
    }
    
    // Retorna fallback se a era não for suportada
    return previousState;
}
