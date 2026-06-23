import { getInitialGameState } from '../src/gameState.js';
import { advanceYear, executeUpgrade, aumentarDefesa, getUpgradeCost } from '../src/simulationEngine.js';
import { checkEvents, resolverBifurcacao } from '../src/eventManager.js';

let state = getInitialGameState();

console.log("==========================================================");
console.log("   SIMULAÇÃO DE ECONOMIA INTELIGENTE (1530-1822)          ");
console.log("==========================================================\n");

// Vamos simular um jogador estratégico inteligente:
// 1. Reduz taxas abusivas (Bahia de 25% para 15%, Pernambuco de 20% para 15%) para evitar rebelião imediata.
// 2. Mantém repasse geral em 50% (0.50) -> Union keeps 50%.
// 3. Prioriza milícias (defesa) sobre upgrades econômicos para garantir estabilidade e fluxo fiscal constante.

state.estados.forEach(est => {
    est.pacto_federativo.repasse_estado = 0.50;
    est.pacto_federativo.retencao_uniao = 0.50;
    
    // Ajusta taxação inicial alta
    if (est.pacto_federativo.aliquota_imposto > 0.15) {
        est.pacto_federativo.aliquota_imposto = 0.15;
    }
});

for (let ano = 1530; ano < 1822; ano++) {
    // A cada 5 anos, toma decisões de forma prioritária
    if (ano % 5 === 0) {
        state.estados.forEach(est => {
            // PRIORIDADE 1: Se revolta > 20% e tem recursos, contrata milícia
            const custoMilicia = getUpgradeCost(est.defesa.milicia_local, 'milicia_local');
            if (est.defesa.indice_revolta > 20 && est.defesa.milicia_local < 3 && state.globais.tesouro_nacional >= custoMilicia) {
                state = aumentarDefesa(state, est.id);
            }
            
            // PRIORIDADE 2: Se revolta > 50%, cede mais repasse temporariamente para pacificar
            if (est.defesa.indice_revolta > 50) {
                est.pacto_federativo.repasse_estado = 0.70;
                est.pacto_federativo.retencao_uniao = 0.30;
            } else {
                est.pacto_federativo.repasse_estado = 0.50;
                est.pacto_federativo.retencao_uniao = 0.50;
            }

            // PRIORIDADE 3: Se o tesouro estiver confortável (> 150) e revolta baixa (< 15%), faz upgrade de portos/estradas
            if (state.globais.tesouro_nacional > 150 && est.defesa.indice_revolta < 15) {
                if (est.infraestrutura.modal_portuario > 0 && est.infraestrutura.modal_portuario < 3 && est.economia.pib_total > 50) {
                    state = executeUpgrade(state, est.id, "modal_portuario");
                }
                if (est.infraestrutura.modal_rodoviario < 3 && est.economia.pib_total > 50) {
                    state = executeUpgrade(state, est.id, "modal_rodoviario");
                }
            }
        });
    }

    state = advanceYear(state);
    state = checkEvents(state);

    if (state.globais.eventos_pendentes_bifurcacao && state.globais.eventos_pendentes_bifurcacao.length > 0) {
        while (state.globais.eventos_pendentes_bifurcacao.length > 0) {
            const ev = state.globais.eventos_pendentes_bifurcacao[0];
            const op = ev.opcoes[0];
            state = resolverBifurcacao(state, ev.id, op.id);
        }
    }

    // Mantém a alíquota tributária máxima em 15% para os estados
    state.estados.forEach(est => {
        if (est.pacto_federativo.aliquota_imposto > 0.15) {
            est.pacto_federativo.aliquota_imposto = 0.15;
        }
        if (est.defesa.indice_revolta <= 50) {
            est.pacto_federativo.repasse_estado = 0.50;
            est.pacto_federativo.retencao_uniao = 0.50;
        }
    });

    if (state.globais.ano_atual % 50 === 0 || state.globais.ano_atual === 1822) {
        const pibTotal = state.estados.reduce((acc, est) => acc + est.economia.pib_total, 0);
        console.log(`[ANO ${state.globais.ano_atual}] Tesouro: $${Math.round(state.globais.tesouro_nacional)} Contos | PIB Nacional: $${Math.round(pibTotal)} Contos | Revolta Média: ${Math.round(state.estados.reduce((acc, est) => acc + est.defesa.indice_revolta, 0) / state.estados.length)}%`);
    }
}

console.log("\nESTADO DAS CAPITANIAS EM 1822:");
console.table(state.estados.map(e => ({
    Nome: e.nome,
    PIB: `$${e.economia.pib_total.toFixed(1)}`,
    Revolta: `${e.defesa.indice_revolta.toFixed(0)}%`,
    Porto: e.infraestrutura.modal_portuario,
    Estrada: e.infraestrutura.modal_rodoviario,
    Milicia: e.defesa.milicia_local,
    Status: e.status_territorio || "controlado"
})));
