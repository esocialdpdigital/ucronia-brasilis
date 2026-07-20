/**
 * timelineEngine.js
 * 
 * O Cérebro da Linha do Tempo do Simulador (Motor Inteligente de Eventos).
 * Gerencia a fila dinâmica de futuros eventos (`state.globais.eventos_futuros`),
 * realizando:
 * 1. Poda (Pruning): Remove eventos que se tornaram biologicamente ou historicamente impossíveis.
 * 2. Deslocamento (Shifting com Inércia): Altera a data de eventos com base em crises ou estabilidade extrema.
 * 3. Injeção Ucrônica (Injection): Insere eventos fictícios caso o nível de divergência seja elevado.
 */

import { eventosColoniais } from '../data/eventos_colonial.js';
import { eventosImperiais } from '../data/eventos_imperial.js';
import { eventosUcronicos } from '../data/eventos_ucronicos.js';

/**
 * Inicializa a fila de eventos futuros para o estado do jogo.
 * @param {Object} state - Estado atual
 * @returns {Object} Estado com a lista de eventos futuros carregada
 */
export function initializeTimeline(state) {
    const newState = JSON.parse(JSON.stringify(state));
    const era = newState.globais.era_atual;

    let baseList = [];
    if (era === "colonial") {
        baseList = eventosColoniais;
    } else if (era === "imperio" || era === "republica") {
        baseList = typeof eventosImperiais !== 'undefined' ? eventosImperiais : [];
    }

    // Clona os eventos para a fila dinâmica mantendo o ano original
    newState.globais.eventos_futuros = baseList.map(evt => {
        const anoOriginal = evt.ano_fixo !== undefined ? evt.ano_fixo : (evt.condicao ? (evt.condicao.ano_fixo || evt.condicao.ano_minimo) : undefined);
        return {
            ...JSON.parse(JSON.stringify(evt)),
            ano_target: anoOriginal,
            ano_original: anoOriginal,
            deslocado: false
        };
    });

    return newState;
}

/**
 * Avalia anualmente a linha do tempo do jogo e recalcula a fila de futuros eventos.
 * @param {Object} state - Estado do jogo
 * @returns {Object} Novo estado atualizado pelo Timeline Engine
 */
export function evaluateTimeline(state) {
    let newState = JSON.parse(JSON.stringify(state));
    
    if (!newState.globais.eventos_futuros || newState.globais.eventos_futuros.length === 0) {
        newState = initializeTimeline(newState);
    }

    const anoAtual = newState.globais.ano_atual;
    const divergencia = newState.globais.divergencia_atual || 0.0;
    const extensoesOcorridas = newState.globais.eventos_ocorridos || {};
    const decisoesTomadas = newState.globais.decisoes_historicas || [];

    // --- 1. PODA (PRUNING) ---
    // Remove eventos cujas precondições se tornaram impossíveis de cumprir
    newState.globais.eventos_futuros = newState.globais.eventos_futuros.filter(evt => {
        // Se o evento já aconteceu, descarta
        if (extensoesOcorridas[evt.id]) {
            return false;
        }

        const cond = evt.condicao;
        if (cond) {
            // Checa exclusão de decisões passadas
            if (cond.decisao_exclui) {
                const excl = cond.decisao_exclui;
                const tomou = decisoesTomadas.some(d => d.evento_id === excl.evento_id && d.opcao_escolhida === excl.opcao_id);
                if (tomou) {
                    console.log(`[TIMELINE ENGINE] Evento ${evt.id} podado (Decisão oposta tomada: ${excl.opcao_id}).`);
                    return false;
                }
            }

            // Checa pré-requisito de decisões passadas
            if (cond.decisao_requer) {
                const req = cond.decisao_requer;
                const tomou = decisoesTomadas.some(d => d.evento_id === req.evento_id && d.opcao_escolhida === req.opcao_id);
                // Se já passou do ano e não tomou a decisão requerida, poda
                if (!tomou && evt.ano_target !== undefined && anoAtual > evt.ano_target) {
                    console.log(`[TIMELINE ENGINE] Evento ${evt.id} podado (Decisão necessária não realizada a tempo).`);
                    return false;
                }
            }

            // Checa flag de independência
            if (cond.independencia_nao_ocorreu === true && newState.globais.independencia_ocorreu === true) {
                console.log(`[TIMELINE ENGINE] Evento ${evt.id} podado (Independência já ocorreu).`);
                return false;
            }
        }

        return true;
    });

    // --- 2. DESLOCAMENTO DE DATAS (SHIFTING COM INÉRCIA HISTÓRICA) ---
    // Só altera a data de eventos se a conjuntura estiver muito distante do normal (inércia)
    const mediaRevolta = newState.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / (newState.estados.length || 1);

    newState.globais.eventos_futuros.forEach(evt => {
        // Ignora eventos que não têm ano alvo definido
        if (evt.ano_target === undefined || evt.ano_target <= anoAtual) return;

        // Regra de Inércia: Requer alteração substancial para mover datas
        // Aceleração por Crise Grave (Revolta > 45% + Divergência > 0.3)
        if (mediaRevolta > 45 && divergencia > 0.30 && !evt.deslocado) {
            if (evt.tipo === "bifurcacao" || evt.tipo === "bifurcacao_independencia") {
                const delta = Math.min(5, Math.floor((mediaRevolta - 35) / 5));
                evt.ano_target = Math.max(anoAtual + 1, evt.ano_original - delta);
                evt.deslocado = true;
                console.log(`[TIMELINE ENGINE] Evento '${evt.nome}' antecipado para ${evt.ano_target} devido a instabilidade e divergência!`);
            }
        }

        // Atraso por Estabilidade Exemplar (Revolta < 10% e Divergência Baixa)
        if (mediaRevolta < 10 && divergencia < 0.15 && !evt.deslocado) {
            if (evt.tipo === "bifurcacao" && evt.id.includes("revolucao")) {
                evt.ano_target = evt.ano_original + 3;
                evt.deslocado = true;
                console.log(`[TIMELINE ENGINE] Evento '${evt.nome}' adiado para ${evt.ano_target} devido a alta estabilidade!`);
            }
        }
    });

    // --- 3. INJEÇÃO UCRÔNICA (INJECTION) ---
    // Insere eventos puramente fictícios caso o nível de divergência seja elevado
    if (divergencia >= 0.25) {
        eventosUcronicos.forEach(evtUcronico => {
            const condU = evtUcronico.condicao_ucronica;
            if (!condU) return;

            const jaOcorreu = extensoesOcorridas[evtUcronico.id];
            const jaNaFila = newState.globais.eventos_futuros.some(e => e.id === evtUcronico.id);

            if (!jaOcorreu && !jaNaFila) {
                if (divergencia >= condU.divergencia_minima && anoAtual >= condU.ano_minimo && anoAtual <= condU.ano_maximo) {
                    const anoInjecao = Math.min(condU.ano_maximo, anoAtual + 2);
                    const novoEvento = {
                        ...JSON.parse(JSON.stringify(evtUcronico)),
                        ano_target: anoInjecao,
                        ano_original: anoInjecao,
                        deslocado: true,
                        is_ucronico_puro: true
                    };
                    newState.globais.eventos_futuros.push(novoEvento);
                    console.log(`[TIMELINE ENGINE] EVENTO UCRÔNICO INJETADO: '${evtUcronico.nome}' agendado para ${anoInjecao}!`);
                }
            }
        });
    }

    return newState;
}

/**
 * Retorna os próximos N eventos mais iminentes na linha do tempo para o Painel de Rumores.
 * @param {Object} state - Estado do jogo
 * @param {number} count - Quantidade de previsões a retornar
 * @returns {Array} Lista de eventos estruturada para a interface de rumores
 */
export function getUpcomingEvents(state, count = 3) {
    if (!state.globais.eventos_futuros) return [];

    const anoAtual = state.globais.ano_atual;
    
    // Filtra apenas eventos futuros ainda não disparados
    const futuros = state.globais.eventos_futuros
        .filter(e => e.ano_target && e.ano_target >= anoAtual && !state.globais.eventos_ocorridos[e.id])
        .sort((a, b) => a.ano_target - b.ano_target);

    return futuros.slice(0, count).map(evt => {
        const anosFaltantes = evt.ano_target - anoAtual;
        let estimativaTexto = "";

        if (anosFaltantes === 0) {
            estimativaTexto = "Iminente (Este Ano)";
        } else if (anosFaltantes === 1) {
            estimativaTexto = "Previsão: Próximo Ano";
        } else {
            estimativaTexto = `Previsão: em ~${anosFaltantes} anos (${evt.ano_target})`;
        }

        return {
            id: evt.id,
            nome: evt.nome,
            estimativa: estimativaTexto,
            anosFaltantes: anosFaltantes,
            is_ucronico: !!evt.is_ucronico_puro,
            descricaoPista: evt.descricao ? evt.descricao.substring(0, 90) + "..." : "Rumores circulam entre as elites locais."
        };
    });
}
