/**
 * simulationEngine.js
 * 
 * O Motor de Regras (Engine).
 * Consiste em funções matemáticas puras que processam o tempo (1 ciclo = 1 ano).
 * Retorna um novo objeto de estado completo para respeitar o desacoplamento e a imutabilidade.
 */

import { historiaCanonica } from '../data/historia_canonica.js';

export const LORE_NIVEIS = {
    modal_portuario: {
        1: "Ancoradouro Rústico",
        2: "Cais de Madeira",
        3: "Porto Alfandegado",
        4: "Companhia de Comércio",
        5: "Porto Internacional"
    },
    modal_rodoviario: {
        1: "Trilhas Indígenas",
        2: "Caminho de Tropas",
        3: "Estrada de Terra Batida",
        4: "Calçamento de Pedra",
        5: "Via Real"
    },
    milicia_local: {
        1: "Capangas e Jagunços",
        2: "Ordenança Local",
        3: "Tropa Auxiliar",
        4: "Tropa de Linha",
        5: "Rede de Fortalezas"
    }
};

export function getUpgradeCost(nivelAtual, tipo) {
    if (nivelAtual === 0) return Infinity; // Sem acesso/bloqueado
    if (nivelAtual >= 5) return Infinity; // Máximo nível 5
    const base = tipo === 'milicia_local' ? 80 : (tipo === 'modal_portuario' ? 150 : 100);
    return base * Math.pow(2, nivelAtual - 1);
}

export function getLevelLore(nivel, tipo, era = "colonial") {
    const n = Math.max(1, Math.min(5, nivel));
    if (tipo === 'modal_rodoviario' && n === 5 && era === 'imperio') {
        return "Ferrovia Inicial";
    }
    return LORE_NIVEIS[tipo][n] || `Nível ${nivel}`;
}

export function getMaintenanceCost(nivel, tipo) {
    if (nivel <= 0) return 0;
    if (tipo === 'modal_portuario') {
        const tabela = [0, 0, 2, 5, 10, 20];
        return nivel < tabela.length ? tabela[nivel] : 20 + (nivel - 5) * 10;
    }
    if (tipo === 'modal_rodoviario') {
        const tabela = [0, 0, 1, 3, 6, 12];
        return nivel < tabela.length ? tabela[nivel] : 12 + (nivel - 5) * 6;
    }
    if (tipo === 'milicia_local') {
        const tabela = [0, 1, 3, 8, 20, 50];
        return nivel < tabela.length ? tabela[nivel] : 50 + (nivel - 5) * 25;
    }
    return 0;
}


export function executeUpgrade(state, estadoId, modal) {
    const newState = JSON.parse(JSON.stringify(state));
    const estado = newState.estados.find(e => e.id === estadoId);
    if (!estado) return newState;

    const nivelAtual = estado.infraestrutura[modal];
    const custo = getUpgradeCost(nivelAtual, modal);

    if (custo !== Infinity && newState.globais.tesouro_nacional >= custo) {
        newState.globais.tesouro_nacional -= custo;
        estado.infraestrutura[modal] += 1;
    }
    return newState;
}

export function financiarBandeiras(state) {
    // Evento único: já foi financiado nesta era
    if (state.globais.bandeiras_financiadas) return state;

    const newState = JSON.parse(JSON.stringify(state));
    const custo = 50;
    
    if (newState.globais.tesouro_nacional >= custo) {
        newState.globais.tesouro_nacional -= custo;
        newState.globais.investimento_exploracao += 100; // Aumenta em 100 para atingir a condição do Ciclo do Ouro
        newState.globais.bandeiras_financiadas = true; // Marca como usado
    }
    return newState;
}


export function aumentarDefesa(state, estadoId) {
    const newState = JSON.parse(JSON.stringify(state));
    const estado = newState.estados.find(e => e.id === estadoId);
    if (!estado) return newState;

    const nivelAtual = estado.defesa.milicia_local;
    const custo = getUpgradeCost(nivelAtual, 'milicia_local');

    if (custo !== Infinity && newState.globais.tesouro_nacional >= custo) {
        newState.globais.tesouro_nacional -= custo;
        estado.defesa.milicia_local += 1;
    }
    return newState;
}

/**
 * Função pura que avança 1 ano no simulador, calculando as mecânicas.
 * Não altera currentState; cria e retorna newState.
 * 
 * @param {Object} currentState - O estado atual do jogo
 * @returns {Object} O novo estado pós-cálculos do ciclo
 */
export function advanceYear(currentState) {
    // Se a era já terminou, bloqueia o avanço de ano até que o jogador tome uma decisão
    if (currentState.globais.fim_da_era) {
        return currentState;
    }

    const newState = JSON.parse(JSON.stringify(currentState));

    // 1. Avança o tempo
    newState.globais.ano_atual += 1;
    newState.globais.alertas_conselho = []; // Limpa os alertas do turno passado

    let totalRecolhidoUniao = 0;
    let custoTotalManutencao = 0;

    // 2. Processamento das Entidades Regionais
    newState.estados.forEach(estado => {
        let bonusInfraestrutura = 0;
        let bonusCiclo = 0;

        // Processa penalidades do estado
        let multiplicadorPib = 1.0;
        let multiplicadorArrecadacao = 1.0;

        if (estado.penalidades) {
            estado.penalidades.forEach(p => {
                if (p.duracao_anos > 0) {
                    if (p.tipo === "pib_penalidade") {
                        multiplicadorPib *= p.valor;
                    }
                    if (p.tipo === "arrecadacao_penalidade") {
                        multiplicadorArrecadacao *= (1.0 - p.valor);
                    }
                    p.duracao_anos--;
                }
            });
            estado.penalidades = estado.penalidades.filter(p => p.duracao_anos > 0);
        }
        estado.penalidade_ativa = estado.penalidades && estado.penalidades.length > 0;

        if (newState.globais.era_atual === "colonial") {
            // --- REGRA ECONÔMICA COLONIAL (Escalada reduzida para evitar hiperinflação) ---
            if (newState.globais.ano_atual <= 1550) {
                // Ciclo do Pau-Brasil: O escoamento portuário é o que mais importa
                bonusInfraestrutura = (estado.infraestrutura.modal_portuario * 0.003) + (estado.infraestrutura.modal_rodoviario * 0.001);
            } else {
                // A partir de 1550: Ciclo do Açúcar (afeta principalmente o Nordeste)
                bonusInfraestrutura = (estado.infraestrutura.modal_portuario + estado.infraestrutura.modal_rodoviario) * 0.002;
                
                // Bônus do Ciclo do Açúcar: Apenas para capitanias nordestinas com vocação agrícola
                const ehNordeste = estado.regiao === "nordeste";
                if (estado.economia.vocacao_agricola && ehNordeste && estado.infraestrutura.modal_portuario >= 3) {
                    bonusCiclo = 0.005; // +0.5% de crescimento ao ano
                } else if (estado.economia.vocacao_agricola && ehNordeste && estado.infraestrutura.modal_portuario < 3) {
                    const msg = "Secretário de Comércio: O açúcar de " + estado.nome + " está apodrecendo nos armazéns por falta de capacidade portuária! (Melhore os portos)";
                    if (!newState.globais.historico_alertas) {
                        newState.globais.historico_alertas = [];
                    }
                    if (!newState.globais.historico_alertas.includes(msg)) {
                        newState.globais.alertas_conselho.push(msg);
                        newState.globais.historico_alertas.push(msg);
                    }
                }
                
                // Bônus base para capitanias do Norte com extração (madeira, drogas do sertão)
                if (estado.regiao === "norte" && estado.infraestrutura.modal_portuario >= 2) {
                    bonusCiclo += 0.002; // +0.2% de comércio de extração
                }
            }
            
            // Ciclo do Ouro Dinâmico (Sudeste / São Vicente)
            if (newState.globais.investimento_exploracao > 500 && estado.id === "sao_vicente" && estado.infraestrutura.modal_rodoviario >= 3) {
                bonusCiclo += 0.015; // Explosão do ouro (+1.5% PIB)
                const msg = "Ministro das Minas: Encontramos ouro em abundância no Sudeste! O Ciclo do Ouro explodiu!";
                if (!newState.globais.historico_alertas) {
                    newState.globais.historico_alertas = [];
                }
                if (!newState.globais.historico_alertas.includes(msg)) {
                    newState.globais.alertas_conselho.push(msg);
                    newState.globais.historico_alertas.push(msg);
                }
            }
        } else if (newState.globais.era_atual === "imperio") {
            // --- REGRA ECONÔMICA IMPERIAL ---
            // A infraestrutura de portos e estradas impulsiona o crescimento geral
            bonusInfraestrutura = (estado.infraestrutura.modal_portuario * 0.002) + (estado.infraestrutura.modal_rodoviario * 0.003);

            // Bônus de Ferrovias (+5% PIB se infraestrutura terrestre >= 2)
            if (estado.infraestrutura.modal_rodoviario >= 2) {
                bonusInfraestrutura += 0.05;
            }

            // Ciclo do Café (SP/RJ/MG) a partir de 1830
            if (["sao_paulo", "rio_de_janeiro", "minas_gerais"].includes(estado.id) && newState.globais.ano_atual >= 1830) {
                if (estado.infraestrutura.modal_rodoviario >= 2) {
                    bonusCiclo = 0.12; // Café cresce muito forte (+12% PIB)
                } else {
                    // Sem ferrovias/estradas adequadas, o café não decola (crescimento base, bonusCiclo = 0)
                    const msg = "Ministro da Fazenda: O café das plantações de " + estado.nome + " sofre com a falta de ferrovias/estradas para escoamento! (Melhore o modal rodoviário)";
                    if (!newState.globais.historico_alertas) {
                        newState.globais.historico_alertas = [];
                    }
                    if (!newState.globais.historico_alertas.includes(msg)) {
                        newState.globais.alertas_conselho.push(msg);
                        newState.globais.historico_alertas.push(msg);
                    }
                }
            }
        }

        // Fatores negativos que retraem a economia: Impostos altos desincentivam, revoltas paralisam a produção.
        const penalidadeImposto = estado.pacto_federativo.aliquota_imposto * (newState.globais.era_atual === "colonial" ? 0.01 : 0.05);
        const penalidadeRevolta = (estado.defesa.indice_revolta / 100) * 0.02;

        // Fator de crescimento final (+0.2% base universal para expansão orgânica colonial/imperial)
        let FatorCrescimento = 1 + 0.002 + bonusInfraestrutura + bonusCiclo - penalidadeImposto - penalidadeRevolta;
        
        // Processa penalidades globais que impactam o crescimento do PIB de todas as províncias (ex: Dívida Externa)
        let multiplicadorPibGlobal = 1.0;
        if (newState.globais.penalidades_ativas) {
            newState.globais.penalidades_ativas.forEach(p => {
                if (p.tipo === "pib_global_penalidade" && p.duracao_anos > 0) {
                    multiplicadorPibGlobal *= p.valor;
                }
            });
        }

        // Aplica o crescimento ao PIB do estado
        estado.economia.pib_total *= (FatorCrescimento * multiplicadorPib * multiplicadorPibGlobal);
        
        // Piso mínimo de subsistência baseado na população total
        const pisoCoef = newState.globais.era_atual === "colonial" ? 0.02 : 0.005;
        const pibMinimo = estado.demografia.populacao_total * pisoCoef;
        estado.economia.pib_total = Math.max(pibMinimo, estado.economia.pib_total);

        // --- CÁLCULO DE ARRECADAÇÃO ---
        estado.sofreu_revolta_colonial = estado.defesa.indice_revolta >= 70
            || (estado.status_territorio && estado.status_territorio !== "controlado");
        if (estado.sofreu_revolta_colonial) {
            estado.economia.arrecadacao_bruta = 0;
        } else {
            estado.economia.arrecadacao_bruta = estado.economia.pib_total * estado.pacto_federativo.aliquota_imposto * multiplicadorArrecadacao;
        }

        // --- CÁLCULO DO PACTO FEDERATIVO E TESOURO ---
        const bonusGlobal = (newState.globais.bonus_arrecadacao || 0);
        const recolhimentoUniao = estado.economia.arrecadacao_bruta * estado.pacto_federativo.retencao_uniao * (1 + bonusGlobal);
        totalRecolhidoUniao += recolhimentoUniao;

        // --- LÓGICA DE MECÂNICA DE ATRITO (REVOLTA) ---
        let deltaRevolta = 0;
        if (estado.pacto_federativo.repasse_estado < 0.30) {
            deltaRevolta += 5;
        } else if (estado.pacto_federativo.repasse_estado > 0.60) {
            deltaRevolta -= 3;
        }

        // Atrito adicional por alta taxação (alíquota acima de 15% gera descontentamento)
        const aliquotaImp = estado.pacto_federativo.aliquota_imposto || 0.10;
        if (aliquotaImp > 0.15) {
            deltaRevolta += Math.round((aliquotaImp - 0.15) * 40);
        } else if (aliquotaImp < 0.08) {
            deltaRevolta -= 2; // Alívio fiscal acalma a população
        }

        // A milícia local ajuda a manter a ordem e reduz a revolta passivamente
        if (estado.defesa.milicia_local > 1) {
            deltaRevolta -= (estado.defesa.milicia_local - 1) * 2;
        }

        estado.defesa.indice_revolta = Math.max(0, Math.min(100, estado.defesa.indice_revolta + deltaRevolta));

        // --- CÁLCULO DE MANUTENÇÃO DE INFRAESTRUTURA E MILÍCIA ---
        const custoPorto = getMaintenanceCost(estado.infraestrutura.modal_portuario, 'modal_portuario');
        const custoEstrada = getMaintenanceCost(estado.infraestrutura.modal_rodoviario, 'modal_rodoviario');
        const custoMilicia = getMaintenanceCost(estado.defesa.milicia_local, 'milicia_local');
        custoTotalManutencao += (custoPorto + custoEstrada + custoMilicia);

        // --- LÓGICA DE INACESSIBILIDADE TERRITORIAL (Fase 3.0) ---
        if (estado.defesa.indice_revolta >= 100) {
            estado.status_territorio = "rebelado";
        } else if (estado.status_territorio === "rebelado" && estado.defesa.indice_revolta < 70) {
            estado.status_territorio = "controlado"; // Recuperação orgânica
        }
        // Decrementar invasão externa
        if (estado.duracao_invasao > 0) {
            estado.duracao_invasao--;
            if (estado.duracao_invasao === 0) {
                estado.status_territorio = "controlado";
                estado.invadido_por = null;
            }
        }
    });

    // Processamento de penalidades globais antes de computar o tesouro final
    if (newState.globais.penalidades_ativas) {
        newState.globais.penalidades_ativas.forEach(p => {
            if (p.duracao_anos > 0) {
                if (p.tipo === "tesouro") {
                    newState.globais.tesouro_nacional += p.valor;
                }
                p.duracao_anos--;
            }
        });
        newState.globais.penalidades_ativas = newState.globais.penalidades_ativas.filter(p => p.duracao_anos > 0);
    }

    // 3. Processamento Final Global
    newState.globais.tesouro_nacional += totalRecolhidoUniao - custoTotalManutencao;
    
    // Alerta de conselho na era colonial para bandeiras
    if (newState.globais.era_atual === "colonial" && newState.globais.ano_atual > 1550 && !newState.globais.bandeiras_financiadas && newState.globais.ano_atual < 1680) {
        const msg = "Conselheiro Ultramarino: Majestade, ao ignorar o interior, o Ciclo do Ouro pode nunca acontecer. Nossas riquezas continuarão enterradas!";
        if (!newState.globais.historico_alertas) {
            newState.globais.historico_alertas = [];
        }
        if (!newState.globais.historico_alertas.includes(msg)) {
            newState.globais.alertas_conselho.push(msg);
            newState.globais.historico_alertas.push(msg);
        }
    }

    // Lembrete em 1680 (10 anos para expirar)
    if (newState.globais.era_atual === "colonial" && newState.globais.ano_atual === 1680 && !newState.globais.bandeiras_financiadas) {
        const msg = "[URGENTE] Conselheiro: Restam apenas 10 anos (até 1690) para financiar as expedições dos Bandeirantes antes que a oportunidade se encerre e a chance do Ciclo do Ouro seja perdida!";
        if (!newState.globais.historico_alertas) {
            newState.globais.historico_alertas = [];
        }
        if (!newState.globais.historico_alertas.includes(msg)) {
            newState.globais.alertas_conselho.push(msg);
            newState.globais.historico_alertas.push(msg);
        }
    }

    // Expiração em 1690
    if (newState.globais.era_atual === "colonial" && newState.globais.ano_atual === 1690 && !newState.globais.bandeiras_financiadas) {
        const msg = "[URGENTE] Conselheiro: A janela de oportunidade para financiar as expedições dos Bandeirantes se encerrou. O interior permanecerá inexplorado nesta era.";
        if (!newState.globais.historico_alertas) {
            newState.globais.historico_alertas = [];
        }
        if (!newState.globais.historico_alertas.includes(msg)) {
            newState.globais.alertas_conselho.push(msg);
            newState.globais.historico_alertas.push(msg);
        }
    }

    // 4. Verificação de Fim de Era
    // Nota: o fim_da_era da Era Colonial é disparado via evento de bifurcação (independencia_1822 ou independencia_precoce).
    // Este bloco apenas garante o fallback do Império para 1889.
    if (newState.globais.era_atual === "colonial" && newState.globais.ano_atual >= 1822 && !newState.globais.independencia_ocorreu) {
        // Garante que o evento de independência 1822 será enfileirado via checkEvents,
        // mas emite um aviso urgente caso ainda não tenha aparecido.
        const msg = "O ano é 1822! O Brasil está à beira da independência. Aguarde o Grito do Ipiranga...";
        if (!newState.globais.alertas_conselho.includes(msg) && !newState.globais.eventos_pendentes_bifurcacao.some(e => e.id === "independencia_1822")) {
            newState.globais.alertas_conselho.push(msg);
        }
    } else if (newState.globais.era_atual === "imperio" && newState.globais.ano_atual >= 1889) {
        // Verifica se o jogador vetou a Lei Áurea e se a média de revolta é > 75%
        const mediaRevolta = newState.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / newState.estados.length;
        const vetouAbolicao = newState.globais.decisoes_historicas && 
            newState.globais.decisoes_historicas.some(d => d.evento_id === "lei_aurea_1888" && d.opcao_escolhida === "vetar_lei_aurea");

        if (vetouAbolicao && mediaRevolta > 75) {
            newState.globais.game_over = true;
            newState.globais.fim_da_era = true;
            const msg = "[FIM DE JOGO] Colapso Monárquico! Devido à recusa de abolir a escravidão, revoltas populares em massa e rebeliões de escravizados derrubaram o Império em caos violento.";
            if (!newState.globais.alertas_conselho.includes(msg)) {
                newState.globais.alertas_conselho.push(msg);
            }
        } else {
            newState.globais.fim_da_era = true;
            const msg = "O ano é 1889! Proclamação da República do Brasil. O Período Imperial terminou.";
            if (!newState.globais.alertas_conselho.includes(msg)) {
                newState.globais.alertas_conselho.push(msg);
            }
        }
    }


    const era = newState.globais.era_atual;
    if (historiaCanonica && historiaCanonica[era] && historiaCanonica[era].snapshots && historiaCanonica[era].snapshots.length > 0) {
        newState.globais.divergencia_atual = calcularDivergencia(
            newState,
            historiaCanonica[era].snapshots,
            historiaCanonica[era].decisoes_canonicas
        );
    } else {
        newState.globais.divergencia_atual = 0.0;
    }

    // Captura snapshot para o histórico e calcula a divergência
    if (!newState.globais.historico_jogador) {
        newState.globais.historico_jogador = [];
    }
    const snap = capturarSnapshot(newState);
    snap.divergencia = newState.globais.divergencia_atual;
    newState.globais.historico_jogador.push(snap);

    if (!newState.globais.eventLog) {
        newState.globais.eventLog = [];
    }
    newState.globais.eventLog.push({
        ano: newState.globais.ano_atual,
        tipo: "info",
        texto: `Ano ${newState.globais.ano_atual} finalizado. Tesouro Nacional: ${Math.round(newState.globais.tesouro_nacional)} Contos. PIB Nacional: ${Math.round(newState.estados.reduce((acc, e) => acc + e.economia.pib_total, 0))} Contos.`
    });

    return newState;
}

/**
 * Solicita o Socorro Régio de Lisboa (Bailout Colonial).
 * Injeta +400 Contos de Réis no tesouro, aumenta revolta nacional em +15%,
 * aumenta retencao_uniao em +0.05 (arrocho fiscal) e adiciona penalidade anual de -15/ano por 25 anos.
 */
export function solicitarSocorroRegio(state) {
    const newState = JSON.parse(JSON.stringify(state));
    
    newState.globais.tesouro_nacional += 400.0;
    
    newState.estados.forEach(estado => {
        estado.defesa.indice_revolta = Math.min(100, estado.defesa.indice_revolta + 15);
        estado.pacto_federativo.retencao_uniao = Math.min(1.0, estado.pacto_federativo.retencao_uniao + 0.05);
        estado.pacto_federativo.repasse_estado = 1.0 - estado.pacto_federativo.retencao_uniao;
    });
    
    if (!newState.globais.penalidades_ativas) {
        newState.globais.penalidades_ativas = [];
    }
    newState.globais.penalidades_ativas.push({
        id: "socorro_regio_divida",
        nome: "Pagamento do Socorro Régio",
        tipo: "tesouro",
        valor: -15.0,
        duracao_anos: 25
    });
    
    const msg = "LISBOA: Recebemos o Socorro Régio de 400 contos! Em contrapartida, oficiais régios iniciaram o arrocho tributário (+5% de retenção), gerando descontentamento generalizado (+15% revolta).";
    if (!newState.globais.alertas_conselho) {
        newState.globais.alertas_conselho = [];
    }
    newState.globais.alertas_conselho.push(msg);

    return newState;
}

/**
 * Solicita o Empréstimo de Londres (Bailout Imperial).
 * Injeta +600 Contos de Réis no tesouro, adiciona penalidade de -35/ano por 20 anos,
 * e dreno de capital global de -0.5% no crescimento do PIB por 20 anos.
 */
export function solicitarEmprestimoLondres(state) {
    const newState = JSON.parse(JSON.stringify(state));
    
    newState.globais.tesouro_nacional += 600.0;
    
    if (!newState.globais.penalidades_ativas) {
        newState.globais.penalidades_ativas = [];
    }
    newState.globais.penalidades_ativas.push({
        id: "emprestimo_londres_divida",
        nome: "Serviço da Dívida de Londres",
        tipo: "tesouro",
        valor: -35.0,
        duracao_anos: 20
    });
    
    newState.globais.penalidades_ativas.push({
        id: "emprestimo_londres_pib",
        nome: "Dreno de Capital Dívida Externa",
        tipo: "pib_global_penalidade",
        valor: 0.995,
        duracao_anos: 20
    });
    
    const msg = "LONDRES: Empréstimo com banqueiros ingleses contratado! R$ 600 contos de réis creditados. O serviço da dívida (-35 contos/ano) e o dreno de capital (-0.5% PIB) foram ativados.";
    if (!newState.globais.alertas_conselho) {
        newState.globais.alertas_conselho = [];
    }
    newState.globais.alertas_conselho.push(msg);

    return newState;
}

/**
 * Captura os agregados nacionais do estado atual e retorna um objeto compacto.
 * @param {Object} state - O estado atual do jogo
 * @returns {Object} Snapshot de dados nacionais
 */
export function capturarSnapshot(state) {
    const estados = state.estados;
    const pib_nacional = estados.reduce((acc, e) => acc + e.economia.pib_total, 0);
    const populacao_total = estados.reduce((acc, e) => acc + e.demografia.populacao_total, 0);
    const revoltas_ativas = estados.filter(e => e.defesa.indice_revolta >= 70).length;
    const media_revolta = estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / (estados.length || 1);
    const portos_media = estados.reduce((acc, e) => acc + e.infraestrutura.modal_portuario, 0) / (estados.length || 1);
    const estradas_media = estados.reduce((acc, e) => acc + e.infraestrutura.modal_rodoviario, 0) / (estados.length || 1);
    const milicia_media = estados.reduce((acc, e) => acc + e.defesa.milicia_local, 0) / (estados.length || 1);

    return {
        ano: state.globais.ano_atual,
        pib_nacional: Math.round(pib_nacional * 100) / 100,
        tesouro: Math.round(state.globais.tesouro_nacional * 100) / 100,
        populacao_total: Math.round(populacao_total),
        revoltas_ativas: revoltas_ativas,
        media_revolta: Math.round(media_revolta * 10) / 10,
        infraestrutura_media: {
            portos: Math.round(portos_media * 100) / 100,
            estradas: Math.round(estradas_media * 100) / 100
        },
        milicia_media: Math.round(milicia_media * 100) / 100
    };
}

/**
 * Realiza a interpolação linear dos valores canônicos para um dado ano.
 * @param {Array} snapshots - Lista de snapshots canônicos
 * @param {number} ano - Ano alvo
 * @returns {Object} Snapshot interpolado
 */
function interpolarSnapshot(snapshots, ano) {
    if (!snapshots || snapshots.length === 0) return null;
    if (ano <= snapshots[0].ano) return snapshots[0];
    if (ano >= snapshots[snapshots.length - 1].ano) return snapshots[snapshots.length - 1];

    for (let i = 0; i < snapshots.length - 1; i++) {
        const sA = snapshots[i];
        const sB = snapshots[i + 1];
        if (ano >= sA.ano && ano <= sB.ano) {
            const t = (ano - sA.ano) / (sB.ano - sA.ano);
            const lerp = (vA, vB) => vA + t * (vB - vA);
            return {
                ano: ano,
                pib_nacional: lerp(sA.pib_nacional, sB.pib_nacional),
                tesouro: lerp(sA.tesouro, sB.tesouro),
                populacao_total: lerp(sA.populacao_total, sB.populacao_total),
                media_revolta: lerp(sA.media_revolta, sB.media_revolta),
                infraestrutura_media: {
                    portos: lerp(sA.infraestrutura_media.portos, sB.infraestrutura_media.portos),
                    estradas: lerp(sA.infraestrutura_media.estradas, sB.infraestrutura_media.estradas)
                },
                milicia_media: lerp(sA.milicia_media, sB.milicia_media)
            };
        }
    }
    return snapshots[snapshots.length - 1];
}

/**
 * Calcula o índice de divergência global do jogador frente à história real.
 * @param {Object} state - Estado atual
 * @param {Array} snapshotsCanonicos - Histórico canônico
 * @param {Object} decisoesCanonica - Gabarito de decisões
 * @returns {number} Divergência calculada (0–100)
 */
export function calcularDivergencia(state, snapshotsCanonicos, decisoesCanonica) {
    const playerSnap = capturarSnapshot(state);
    const realSnap = interpolarSnapshot(snapshotsCanonicos, state.globais.ano_atual);
    
    if (!realSnap) return 0.0;

    // 1. PIB Nacional (25%)
    const diff_pib = Math.abs(playerSnap.pib_nacional - realSnap.pib_nacional) / (realSnap.pib_nacional || 1);
    const score_pib = Math.min(1.0, diff_pib);

    // 2. Tesouro Nacional (15%)
    const diff_tesouro = Math.abs(playerSnap.tesouro - realSnap.tesouro) / Math.max(Math.abs(realSnap.tesouro), 50.0);
    const score_tesouro = Math.min(1.0, diff_tesouro);

    // 3. População (10%)
    const diff_pop = Math.abs(playerSnap.populacao_total - realSnap.populacao_total) / (realSnap.populacao_total || 1);
    const score_pop = Math.min(1.0, diff_pop);

    // 4. Estabilidade Social (15%)
    const diff_revolta = Math.abs(playerSnap.media_revolta - realSnap.media_revolta) / 100.0;
    const score_revolta = Math.min(1.0, diff_revolta);

    // 5. Infraestrutura (15%)
    const portos_player = playerSnap.infraestrutura_media.portos;
    const portos_real = realSnap.infraestrutura_media.portos;
    const estradas_player = playerSnap.infraestrutura_media.estradas;
    const estradas_real = realSnap.infraestrutura_media.estradas;
    const diff_portos = Math.abs(portos_player - portos_real) / Math.max(portos_real, 1.0);
    const diff_estradas = Math.abs(estradas_player - estradas_real) / Math.max(estradas_real, 1.0);
    const score_infra = Math.min(1.0, (diff_portos + diff_estradas) / 2.0);

    // 6. Decisões Históricas (20%)
    let totalDecisoes = 0;
    let ucroneas = 0;
    if (state.globais.decisoes_historicas && state.globais.decisoes_historicas.length > 0) {
        state.globais.decisoes_historicas.forEach(d => {
            const canonicalOpt = decisoesCanonica[d.evento_id];
            if (canonicalOpt !== undefined) {
                totalDecisoes++;
                if (d.opcao_escolhida !== canonicalOpt) {
                    ucroneas++;
                }
            }
        });
    }
    const score_decisoes = totalDecisoes > 0 ? (ucroneas / totalDecisoes) : 0.0;

    // Fórmula Final Ponderada
    const divergencia = (
        0.25 * score_pib +
        0.15 * score_tesouro +
        0.10 * score_pop +
        0.15 * score_revolta +
        0.15 * score_infra +
        0.20 * score_decisoes
    ) * 100.0;

    return Math.round(divergencia * 10) / 10;
}

/**
 * Ataca militarmente um território inacessível para recuperar o controle.
 * Custo: 250 Contos de Réis.
 * Se invadido: recupera controle imediato.
 * Se rebelado: reduz revolta em 50 pontos.
 * @param {Object} state - Estado atual
 * @param {string} estadoId - ID do território a atacar
 * @returns {Object} Novo estado
 */
export function atacarTerritorio(state, estadoId) {
    const newState = JSON.parse(JSON.stringify(state));
    const custo = 250;

    if (newState.globais.tesouro_nacional < custo) {
        newState.globais.alertas_conselho = newState.globais.alertas_conselho || [];
        newState.globais.alertas_conselho.push(
            `[ERRO] Tesouro insuficiente para lançar campanha militar! Necessário: ${custo} Contos.`
        );
        return newState;
    }

    const estado = newState.estados.find(e => e.id === estadoId);
    if (!estado) return newState;

    newState.globais.tesouro_nacional -= custo;

    if (estado.status_territorio === "invadido") {
        estado.status_territorio = "controlado";
        estado.invadido_por = null;
        estado.duracao_invasao = 0;
        newState.globais.alertas_conselho = newState.globais.alertas_conselho || [];
        newState.globais.alertas_conselho.push(
            `[MILITAR] ⚔️ Campanha de reconquista bem-sucedida! ${estado.nome} foi libertada do domínio estrangeiro. (-${custo} Contos)`
        );
    } else if (estado.status_territorio === "rebelado") {
        estado.defesa.indice_revolta = Math.max(0, estado.defesa.indice_revolta - 50);
        if (estado.defesa.indice_revolta < 70) {
            estado.status_territorio = "controlado";
        }
        newState.globais.alertas_conselho = newState.globais.alertas_conselho || [];
        newState.globais.alertas_conselho.push(
            `[MILITAR] ⚔️ Intervenção militar em ${estado.nome}! Revolta reduzida em 50%. (-${custo} Contos)`
        );
    }

    return newState;
}

/**
 * Negocia diplomaticamente a recuperação de um território inacessível.
 * Sem custo imediato, mas aplica penalidade de -50% na arrecadação por 10 anos.
 * @param {Object} state - Estado atual
 * @param {string} estadoId - ID do território a negociar
 * @returns {Object} Novo estado
 */
export function negociarTerritorio(state, estadoId) {
    const newState = JSON.parse(JSON.stringify(state));

    const estado = newState.estados.find(e => e.id === estadoId);
    if (!estado) return newState;

    // Aplica penalidade de arrecadação por 10 anos
    estado.penalidades = estado.penalidades || [];
    estado.penalidades.push({
        tipo: "arrecadacao_penalidade",
        nome: "Concessões Diplomáticas",
        valor: 0.50,
        duracao_anos: 10
    });
    estado.penalidade_ativa = true;

    estado.status_territorio = "controlado";
    estado.invadido_por = null;
    estado.duracao_invasao = 0;

    newState.globais.alertas_conselho = newState.globais.alertas_conselho || [];
    newState.globais.alertas_conselho.push(
        `[DIPLOMACIA] 🤝 Acordo diplomático firmado para ${estado.nome}. Território recuperado, mas com concessões onerosas (-50% arrecadação por 10 anos).`
    );

    return newState;
}

export function decretarImpostosExtraordinarios(state) {
    const newState = JSON.parse(JSON.stringify(state));
    newState.globais.tesouro_nacional += 150.0;
    newState.estados.forEach(est => {
        const statusTerr = est.status_territorio || "controlado";
        if (statusTerr === "controlado" || statusTerr === "rebelado") {
            est.defesa.indice_revolta = Math.max(0, Math.min(100, est.defesa.indice_revolta + 10));
        }
    });
    
    const msg = `Poder Moderador: Impostos Extraordinários decretados pelo Imperador (+150 Contos, +10% Revolta global).`;
    newState.globais.eventLog = newState.globais.eventLog || [];
    newState.globais.eventLog.push({
        ano: newState.globais.ano_atual,
        tipo: "decisao",
        texto: msg
    });
    
    return newState;
}

export function dissolverAssembleiaGeral(state) {
    const newState = JSON.parse(JSON.stringify(state));
    const custo = 80.0;
    if (newState.globais.tesouro_nacional >= custo) {
        newState.globais.tesouro_nacional -= custo;
        newState.estados.forEach(est => {
            const statusTerr = est.status_territorio || "controlado";
            if (statusTerr === "controlado" || statusTerr === "rebelado") {
                est.defesa.indice_revolta = Math.max(0, Math.min(100, est.defesa.indice_revolta - 15));
            }
        });
        
        const msg = `Poder Moderador: Assembleia Geral dissolvida pelo Imperador (-80 Contos, -15% Revolta global).`;
        newState.globais.eventLog = newState.globais.eventLog || [];
        newState.globais.eventLog.push({
            ano: newState.globais.ano_atual,
            tipo: "decisao",
            texto: msg
        });
    }
    return newState;
}
