/**
 * eventManager.js
 * 
 * O Gerenciador de Eventos.
 * Avalia condições baseadas no estado atual do mundo e aplica mutações (efeitos)
 * caso os gatilhos históricos ou fictícios sejam atingidos.
 */

import { eventosColoniais } from '../data/eventos_colonial.js';
import { eventosImperiais } from '../data/eventos_imperial.js';

/**
 * Função de fallback para eventos que não estão no arquivo JSON/JS de dados.
 */
export const exampleEventsList = []/**
 * Verifica se a condição de um evento é satisfeita pelo estado atual do jogo.
 * @param {Object} state - O estado do jogo
 * @param {Object} evento - O objeto de evento declarativo
 * @returns {boolean} True se a condição for satisfeita
 */
function evaluateCondition(state, evento) {
    // Se o evento possui ano_target definido pelo Timeline Engine ou ano_fixo, verifica se bate com o ano atual
    const anoAlvo = evento.ano_target !== undefined ? evento.ano_target : evento.ano_fixo;
    if (anoAlvo !== undefined && state.globais.ano_atual !== anoAlvo) {
        return false;
    }

    // Se possui regras condicionais
    if (evento.condicao) {
        const cond = evento.condicao;

        if (cond.ano_minimo !== undefined && state.globais.ano_atual < cond.ano_minimo) {
            return false;
        }
        if (cond.ano_maximo !== undefined && state.globais.ano_atual > cond.ano_maximo) {
            return false;
        }
        if (cond.tesouro_minimo !== undefined && state.globais.tesouro_nacional < cond.tesouro_minimo) {
            return false;
        }
        if (cond.investimento_exploracao_minimo !== undefined && state.globais.investimento_exploracao < cond.investimento_exploracao_minimo) {
            return false;
        }
        if (cond.ano_fixo !== undefined && state.globais.ano_atual !== cond.ano_fixo) {
            return false;
        }

        // === CONDIÇÕES DE INDEPENDÊNCIA ===
        // Verifica se a independência já ocorreu (bloqueia re-disparo)
        if (cond.independencia_nao_ocorreu === true && state.globais.independencia_ocorreu === true) {
            return false;
        }
        // Verifica se foi adiada recentemente (cooldown)
        if (cond.independencia_nao_ocorreu === true && state.globais.independencia_adiada_ate !== undefined) {
            if (state.globais.ano_atual < state.globais.independencia_adiada_ate) {
                return false;
            }
        }
        // Verifica PIB Nacional mínimo
        if (cond.pib_nacional_minimo !== undefined) {
            const pibNacional = state.estados.reduce((acc, e) => acc + e.economia.pib_total, 0);
            if (pibNacional < cond.pib_nacional_minimo) return false;
        }
        // Verifica Tesouro Nacional mínimo (usando chave diferente de tesouro_minimo para clareza)
        if (cond.tesouro_nacional_minimo !== undefined && state.globais.tesouro_nacional < cond.tesouro_nacional_minimo) {
            return false;
        }
        // Verifica Média de Revolta Nacional mínima
        if (cond.media_revolta_minima !== undefined) {
            const mediaRevolta = state.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / (state.estados.length || 1);
            if (mediaRevolta < cond.media_revolta_minima) return false;
        }

        // Condições de decisões passadas
        if (cond.decisao_requer) {
            const req = cond.decisao_requer;
            const tomou = state.globais.decisoes_historicas && state.globais.decisoes_historicas.some(d => d.evento_id === req.evento_id && d.opcao_escolhida === req.opcao_id);
            if (!tomou) return false;
        }
        if (cond.decisao_exclui) {
            const excl = cond.decisao_exclui;
            const tomou = state.globais.decisoes_historicas && state.globais.decisoes_historicas.some(d => d.evento_id === excl.evento_id && d.opcao_escolhida === excl.opcao_id);
            if (tomou) return false;
        }

        if (cond.algum_estado) {
            const req = cond.algum_estado;
            const atende = state.estados.some(estado => {
                if (req.estado_especifico !== undefined && estado.id !== req.estado_especifico) {
                    return false;
                }
                if (req.defesa_maximo !== undefined && estado.defesa.milicia_local > req.defesa_maximo) {
                    return false;
                }
                if (req.pib_minimo !== undefined && estado.economia.pib_total < req.pib_minimo) {
                    return false;
                }
                if (req.revolta_minimo !== undefined && estado.defesa.indice_revolta < req.revolta_minimo) {
                    return false;
                }
                if (req.aliquota_minimo !== undefined && estado.pacto_federativo.aliquota_imposto < req.aliquota_minimo) {
                    return false;
                }
                return true;
            });
            if (!atende) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Aplica os efeitos de um evento automático ao estado.
 * @param {Object} state - Estado atual
 * @param {Object} evento - O evento automático
 * @returns {Object} Novo estado modificado
 */
function applyAutomaticEffects(state, evento) {
    const newState = JSON.parse(JSON.stringify(state));
    const efeitos = evento.efeitos;

    if (!efeitos) return newState;

    if (efeitos.tesouro_delta !== undefined) {
        newState.globais.tesouro_nacional += efeitos.tesouro_delta;
    }

    if (efeitos.reduzir_porto_aleatorio) {
        const elegiveis = newState.estados.filter(e => e.infraestrutura.modal_portuario > 1);
        if (elegiveis.length > 0) {
            const sorteado = elegiveis[Math.floor(Math.random() * elegiveis.length)];
            sorteado.infraestrutura.modal_portuario = Math.max(0, sorteado.infraestrutura.modal_portuario - 1);
            const msg = `[URGENTE] Corsários franceses bombardearam as docas de ${sorteado.nome}! Porto reduzido para nível ${sorteado.infraestrutura.modal_portuario}.`;
            newState.globais.alertas_conselho.push(msg);
            newState.globais.eventLog = newState.globais.eventLog || [];
            newState.globais.eventLog.push({ ano: newState.globais.ano_atual, tipo: "evento", texto: msg });
        } else {
            const msg = `[URGENTE] Corsários franceses atacaram a costa brasileira! Sem docas prósperas para saquear, 150 Contos foram pilhados do comércio nacional.`;
            newState.globais.alertas_conselho.push(msg);
            newState.globais.eventLog = newState.globais.eventLog || [];
            newState.globais.eventLog.push({ ano: newState.globais.ano_atual, tipo: "evento", texto: msg });
        }
    }

    if (efeitos.penalidade_anual_regiao) {
        const pen = efeitos.penalidade_anual_regiao;
        newState.estados.forEach(estado => {
            if (estado.regiao === pen.regiao) {
                estado.penalidades = estado.penalidades || [];
                estado.penalidades.push({
                    tipo: pen.tipo,
                    valor: pen.valor,
                    duracao_anos: pen.duracao_anos
                });
                estado.penalidade_ativa = true;
            }
        });
    }

    if (efeitos.revolta_delta_regiao) {
        const rev = efeitos.revolta_delta_regiao;
        newState.estados.forEach(estado => {
            if (estado.regiao === rev.regiao) {
                estado.defesa.indice_revolta = Math.max(0, Math.min(100, estado.defesa.indice_revolta + rev.valor));
            }
        });
    }

    if (evento.descricao) {
        newState.globais.alertas_conselho.push(`[AVISO] ${evento.nome}: ${evento.descricao}`);
    }

    return newState;
}

/**
 * Verifica eventos elegíveis e aplica suas consequências sobre o estado do jogo.
 * Segue o paradigma purista: recebe um estado, retorna um novo estado alterado.
 * 
 * @param {Object} currentState - O estado processado no fim do ciclo anual
 * @param {Array} eventsList - Lista de eventos a serem avaliados (opcional, usa eventosColoniais por padrão)
 * @returns {Object} Novo estado com as consequências dos eventos aplicadas
 */
export function checkEvents(currentState, eventsList = null) {
    let newState = JSON.parse(JSON.stringify(currentState));
    
    if (!newState.globais.eventos_ocorridos) {
        newState.globais.eventos_ocorridos = {};
    }
    if (!newState.globais.eventos_pendentes_bifurcacao) {
        newState.globais.eventos_pendentes_bifurcacao = [];
    }
    if (!newState.globais.eventLog) {
        newState.globais.eventLog = [];
    }

    const eraAtual = newState.globais.era_atual;
    let list = eventsList;
    if (!list) {
        // Se houver uma fila dinâmica de futuros eventos processada pelo Timeline Engine, utiliza ela
        if (newState.globais.eventos_futuros && newState.globais.eventos_futuros.length > 0) {
            list = newState.globais.eventos_futuros;
        } else {
            list = eraAtual === "imperio" ? eventosImperiais : eventosColoniais;
        }
    }
    
    // Filtra apenas eventos que combinam com a era atual
    const eventosFiltrados = list.filter(e => {
        return !e.era || e.era === eraAtual || (eraAtual === "colonial" && list === eventosColoniais) || (eraAtual === "imperio" && list === eventosImperiais);
    });

    eventosFiltrados.forEach(evento => {
        // Ignora eventos que já ocorreram na simulação ou que estão na fila de bifurcação
        if (newState.globais.eventos_ocorridos[evento.id]) {
            return;
        }
        if (newState.globais.eventos_pendentes_bifurcacao.some(pe => pe.id === evento.id)) {
            return;
        }

        // Checa a condição de ativação
        if (evaluateCondition(newState, evento)) {
            if (evento.tipo === "bifurcacao" || evento.tipo === "bifurcacao_independencia") {
                // Adiciona na fila de bifurcações pendentes para que a View abra o modal de escolha
                newState.globais.eventos_pendentes_bifurcacao.push(evento);
            } else {
                // Evento automático
                console.log(`[EVENTO DISPARADO] Ano ${newState.globais.ano_atual}: ${evento.nome}`);
                newState = applyAutomaticEffects(newState, evento);
                newState.globais.eventos_ocorridos[evento.id] = true;
                newState.globais.eventLog.push({
                    ano: newState.globais.ano_atual,
                    tipo: "evento",
                    texto: `Acontecimento: ${evento.nome} — ${evento.descricao || ""}`
                });
            }
        }
    });

    // --- EVENTOS SISTÊMICOS / GENÉRICOS (Era Colonial) ---
    if (eraAtual === "colonial") {
        newState.estados.forEach(estado => {
            const estadoPrev = currentState.estados.find(e => e.id === estado.id);
            const estavaRebelado = estadoPrev && estadoPrev.defesa.indice_revolta >= 70;
            const estaRebelado = estado.defesa.indice_revolta >= 70;

            // 1. Notificação de Revolta Colonial
            if (estaRebelado && !estavaRebelado) {
                const msgRevolta = `[URGENTE] Revolta em ${estado.nome}! A população rebelou-se contra as pressões fiscais. A arrecadação foi paralisada!`;
                if (!newState.globais.alertas_conselho.includes(msgRevolta)) {
                    newState.globais.alertas_conselho.push(msgRevolta);
                }
                newState.globais.eventLog.push({
                    ano: newState.globais.ano_atual,
                    tipo: "evento",
                    texto: msgRevolta
                });
            }

            // 2. Restauração da Ordem
            if (estaRebelado && estado.defesa.milicia_local >= 3) {
                estado.defesa.indice_revolta = Math.max(0, estado.defesa.indice_revolta - 25);
                // Atualiza o flag sofrido
                estado.sofreu_revolta_colonial = estado.defesa.indice_revolta >= 70;
                
                const msgRestauracao = `[MILITAR] Restauração da Ordem em ${estado.nome}: A milícia local (Nível ${estado.defesa.milicia_local}) dispersou as revoltas e acalmou a população (-25% Revolta).`;
                if (!newState.globais.alertas_conselho.includes(msgRestauracao)) {
                    newState.globais.alertas_conselho.push(msgRestauracao);
                }
                newState.globais.eventLog.push({
                    ano: newState.globais.ano_atual,
                    tipo: "evento",
                    texto: msgRestauracao
                });
            }
        });
    }

    return newState;
}

/**
 * Aplica os efeitos de uma escolha do jogador em um evento do tipo bifurcação.
 * 
 * @param {Object} currentState - O estado atual do jogo
 * @param {string} eventoId - ID do evento resolvido
 * @param {string} opcaoId - ID da opção escolhida pelo jogador
 * @returns {Object} Novo estado modificado
 */
export function resolverBifurcacao(currentState, eventoId, opcaoId) {
    let newState = JSON.parse(JSON.stringify(currentState));
    
    const pendentes = newState.globais.eventos_pendentes_bifurcacao || [];
    const idx = pendentes.findIndex(e => e.id === eventoId);
    
    if (idx === -1) {
        console.warn(`Evento de bifurcação ${eventoId} não encontrado.`);
        return newState;
    }

    const evento = pendentes[idx];
    const opcao = evento.opcoes.find(o => o.id === opcaoId);

    if (!opcao) {
        console.warn(`Opção ${opcaoId} não encontrada para o evento ${eventoId}.`);
        return newState;
    }

    console.log(`[BIFURCAÇÃO RESOLVIDA] ${evento.nome} -> ${opcao.texto}`);
    
    const efeitos = opcao.efeitos;
    if (efeitos) {
        if (efeitos.tesouro_delta !== undefined) {
            newState.globais.tesouro_nacional += efeitos.tesouro_delta;
        }

        if (efeitos.bonus_arrecadacao_global !== undefined) {
            newState.globais.bonus_arrecadacao = (newState.globais.bonus_arrecadacao || 0) + efeitos.bonus_arrecadacao_global;
        }

        if (efeitos.revolta_delta) {
            for (const [estadoId, delta] of Object.entries(efeitos.revolta_delta)) {
                const est = newState.estados.find(e => e.id === estadoId);
                if (est) {
                    est.defesa.indice_revolta = Math.max(0, Math.min(100, est.defesa.indice_revolta + delta));
                }
            }
        }

        if (efeitos.aliquota_delta_global !== undefined) {
            newState.estados.forEach(est => {
                est.pacto_federativo.aliquota_imposto = Math.max(0, Math.min(1.0, est.pacto_federativo.aliquota_imposto + efeitos.aliquota_delta_global));
            });
        }

        if (efeitos.revolta_delta_global !== undefined) {
            newState.estados.forEach(est => {
                est.defesa.indice_revolta = Math.max(0, Math.min(100, est.defesa.indice_revolta + efeitos.revolta_delta_global));
            });
        }

        if (efeitos.milicia_delta) {
            for (const [estadoId, delta] of Object.entries(efeitos.milicia_delta)) {
                const est = newState.estados.find(e => e.id === estadoId);
                if (est) {
                    est.defesa.milicia_local = Math.max(0, est.defesa.milicia_local + delta);
                }
            }
        }

        if (efeitos.penalidade_anual_global) {
            newState.globais.penalidades_ativas = newState.globais.penalidades_ativas || [];
            newState.globais.penalidades_ativas.push(JSON.parse(JSON.stringify(efeitos.penalidade_anual_global)));
        }

        if (efeitos.penalidade_anual_estado) {
            const pen = efeitos.penalidade_anual_estado;
            const est = newState.estados.find(e => e.id === pen.estadoId);
            if (est) {
                est.penalidades = est.penalidades || [];
                est.penalidades.push({
                    tipo: pen.tipo,
                    valor: pen.valor,
                    duracao_anos: pen.duracao_anos
                });
                est.penalidade_ativa = true;
            }
        }

        if (efeitos.pib_multiplicador) {
            for (const [estadoId, mult] of Object.entries(efeitos.pib_multiplicador)) {
                const est = newState.estados.find(e => e.id === estadoId);
                if (est) {
                    est.economia.pib_total = Math.round(est.economia.pib_total * mult * 10) / 10;
                }
            }
        }

        if (efeitos.aliquota_delta) {
            for (const [estadoId, delta] of Object.entries(efeitos.aliquota_delta)) {
                const est = newState.estados.find(e => e.id === estadoId);
                if (est) {
                    est.pacto_federativo.aliquota_imposto = Math.max(0, Math.min(1.0, est.pacto_federativo.aliquota_imposto + delta));
                }
            }
        }

        if (efeitos.penalidade_anual_regiao) {
            const pen = efeitos.penalidade_anual_regiao;
            newState.estados.forEach(estado => {
                if (estado.regiao === pen.regiao) {
                    estado.penalidades = estado.penalidades || [];
                    estado.penalidades.push({
                        tipo: pen.tipo,
                        valor: pen.valor,
                        duracao_anos: pen.duracao_anos
                    });
                    estado.penalidade_ativa = true;
                }
            });
        }

        // Handler genérico para setar status de território (invasão, independência, etc.)
        if (efeitos.set_status_territorio) {
            const alvo = newState.estados.find(e => e.id === efeitos.set_status_territorio.estadoId);
            if (alvo) {
                alvo.status_territorio = efeitos.set_status_territorio.status;
                alvo.invadido_por = efeitos.set_status_territorio.invadido_por || null;
                alvo.duracao_invasao = efeitos.set_status_territorio.duracao_invasao || 0;
            }
        }
    }

    // === EFEITO ESPECIAL: Independência Adiada ===
    if (efeitos && efeitos.adiar_independencia_anos) {
        // Não marca como ocorrido permanentemente — apenas define um cooldown
        newState.globais.independencia_adiada_ate = newState.globais.ano_atual + efeitos.adiar_independencia_anos;
        newState.globais.eventos_pendentes_bifurcacao.splice(idx, 1);
        // Não adiciona em eventos_ocorridos (permitirá re-disparo após cooldown)
        if (!newState.globais.decisoes_historicas) newState.globais.decisoes_historicas = [];
        newState.globais.decisoes_historicas.push({
            evento_id: eventoId,
            opcao_escolhida: opcaoId,
            ano: newState.globais.ano_atual,
            nome_evento: evento.nome,
            nome_opcao: opcao.texto
        });
        newState.globais.eventLog = newState.globais.eventLog || [];
        newState.globais.eventLog.push({
            ano: newState.globais.ano_atual,
            tipo: "decisao",
            texto: `Decisão em "${evento.nome}": "${opcao.texto}" — A janela de independência reabrirá em ${newState.globais.independencia_adiada_ate}.`
        });
        newState.globais.alertas_conselho.push(`[HISTÓRICO] Independência adiada. Os movimentos emancipatórios serão reativados por volta de ${newState.globais.independencia_adiada_ate}.`);
        return newState;
    }

    // Remove das pendências e marca como ocorrido
    newState.globais.eventos_pendentes_bifurcacao.splice(idx, 1);
    newState.globais.eventos_ocorridos[eventoId] = true;

    if (!newState.globais.decisoes_historicas) {
        newState.globais.decisoes_historicas = [];
    }
    newState.globais.decisoes_historicas.push({
        evento_id: eventoId,
        opcao_escolhida: opcaoId,
        ano: newState.globais.ano_atual,
        nome_evento: evento.nome,
        nome_opcao: opcao.texto
    });

    if (!newState.globais.eventLog) {
        newState.globais.eventLog = [];
    }

    // === EFEITO ESPECIAL: Fim de Era via Proclamação de Independência ===
    if (efeitos && efeitos.fim_da_era_trigger === true) {
        newState.globais.independencia_ocorreu = true;
        newState.globais.tipo_independencia = opcao.tipo_resultado || "historica";
        newState.globais.ano_independencia = newState.globais.ano_atual;
        newState.globais.fim_da_era = true;
        newState.globais.eventLog.push({
            ano: newState.globais.ano_atual,
            tipo: "independencia",
            texto: `🇧🇷 INDEPENDÊNCIA PROCLAMADA! "${opcao.texto}" — O Brasil torna-se uma nação livre. A Era Colonial encerra-se no ano ${newState.globais.ano_atual}.`
        });
        newState.globais.alertas_conselho.push(`[HISTÓRICO] ⚑ INDEPENDÊNCIA DO BRASIL PROCLAMADA em ${newState.globais.ano_atual}! "${opcao.texto}". A Era Colonial chegou ao fim.`);
        return newState;
    }

    newState.globais.eventLog.push({
        ano: newState.globais.ano_atual,
        tipo: "decisao",
        texto: `Decisão em "${evento.nome}": Selecionado "${opcao.texto}" — ${opcao.descricao || ""}`
    });

    // Conselho
    newState.globais.alertas_conselho.push(`[HISTÓRICO] Resolvido: ${evento.nome} — Decisão tomada: "${opcao.texto}".`);

    return newState;
}
