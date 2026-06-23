/**
 * testTransition.js
 * 
 * Executa uma simulação rápida que vai até 1822 (fim da Era Colonial),
 * valida o bloqueio de fim de era, executa a transição ucrônica e canônica,
 * e avança mais alguns anos para provar a consistência da Engine na Era Imperial.
 */

import { getInitialGameState, transitionToEra } from '../src/gameState.js';
import { advanceYear } from '../src/simulationEngine.js';
import { checkEvents, resolverBifurcacao } from '../src/eventManager.js';

console.log("==========================================================");
console.log("    TESTE DE TRANSIÇÃO DE ERA: COLÔNIA -> IMPÉRIO         ");
console.log("==========================================================\n");

// 1. Inicializa o estado original
let state = getInitialGameState();
console.log(`[INÍCIO] Ano inicial: ${state.globais.ano_atual} | Era: ${state.globais.era_atual}`);

// 2. Acelera o ano diretamente para 1821 para fins de teste rápido
state.globais.ano_atual = 1821;
console.log(`[SALTO] Avançado artificialmente para o ano: ${state.globais.ano_atual}`);

// Investe um pouco em São Vicente para gerar herança ucrônica
const saoVicente = state.estados.find(e => e.id === "sao_vicente");
if (saoVicente) {
    saoVicente.economia.pib_total = 850.0; // Enriquecimento ucrônico
    saoVicente.infraestrutura.modal_portuario = 6;
    saoVicente.infraestrutura.modal_rodoviario = 5;
    console.log(`[UCRONIA] São Vicente enriquecida artificialmente. PIB: $${saoVicente.economia.pib_total} | Porto: Nível ${saoVicente.infraestrutura.modal_portuario}`);
}

// 3. Avança um ano. Deve atingir 1822 e enfileirar o evento de independência
state = advanceYear(state);
state = checkEvents(state);
console.log(`\n[AVANÇO] Ano atual: ${state.globais.ano_atual} | Era: ${state.globais.era_atual}`);
console.log(`[VALIDAÇÃO] Bifurcações pendentes: ${state.globais.eventos_pendentes_bifurcacao.map(e => e.id).join(', ')}`);

// Resolve o evento de independência (Canônica) proclamando a independência com Dom Pedro I
const eventId = "independencia_1822";
const optionId = "proclamar_dom_pedro";
state = resolverBifurcacao(state, eventId, optionId);

console.log(`[VALIDAÇÃO] Após resolução de independência - fim_da_era: ${state.globais.fim_da_era}`);

if (state.globais.fim_da_era !== true) {
    console.error("ERRO: fim_da_era deveria ser true após a resolução da independência!");
    process.exit(1);
}

// Tenta avançar o ano enquanto fim_da_era é true. O estado não deve mudar.
const anoAntes = state.globais.ano_atual;
state = advanceYear(state);
if (state.globais.ano_atual !== anoAntes) {
    console.error("ERRO: advanceYear avançou o ano mesmo com fim_da_era ativa!");
    process.exit(1);
}
console.log("[SUCESSO] Bloqueio de avanço de ano ativo e validado.");

// 4. TESTAR TRANSIÇÃO CANÔNICA
console.log("\n----------------------------------------------------------");
console.log(" Testando Transição Canônica (História Real de 1822)");
console.log("----------------------------------------------------------");

let estadoCanonico = transitionToEra(state, "imperio", "canonica");
console.log(`[CANÔNICO] Nova Era: ${estadoCanonico.globais.era_atual} | Ano: ${estadoCanonico.globais.ano_atual}`);
console.log(`[CANÔNICO] Total de Províncias: ${estadoCanonico.estados.length}`);
console.log(`[CANÔNICO] PIB de São Paulo (canônico): $${estadoCanonico.estados.find(e => e.id === "sao_paulo").economia.pib_total}`);
console.log(`[CANÔNICO] Porto de São Paulo (canônico): Nível ${estadoCanonico.estados.find(e => e.id === "sao_paulo").infraestrutura.modal_portuario}`);

// Avança 2 anos no Império Canônico para ver se roda limpo
estadoCanonico = advanceYear(estadoCanonico);
estadoCanonico = advanceYear(estadoCanonico);
console.log(`[CANÔNICO] Avançado +2 anos. Ano atual: ${estadoCanonico.globais.ano_atual} | Tesouro: $${estadoCanonico.globais.tesouro_nacional.toFixed(2)}`);

// 5. TESTAR TRANSIÇÃO UCRÔNICA
console.log("\n----------------------------------------------------------");
console.log(" Testando Transição Ucrônica (Herança de Riquezas)");
console.log("----------------------------------------------------------");

let estadoUcronico = transitionToEra(state, "imperio", "ucronica");
console.log(`[UCRÔNICO] Nova Era: ${estadoUcronico.globais.era_atual} | Ano: ${estadoUcronico.globais.ano_atual}`);
console.log(`[UCRÔNICO] Total de Províncias: ${estadoUcronico.estados.length}`);

const spUcronico = estadoUcronico.estados.find(e => e.id === "sao_paulo");
console.log(`[UCRÔNICO] PIB de São Paulo (herdado de São Vicente/Santo Amaro): $${spUcronico.economia.pib_total}`);
console.log(`[UCRÔNICO] Porto de São Paulo (herdado - nível máximo): Nível ${spUcronico.infraestrutura.modal_portuario}`);
console.log(`[UCRÔNICO] Estrada de São Paulo (herdado - nível máximo): Nível ${spUcronico.infraestrutura.modal_rodoviario}`);

if (spUcronico.economia.pib_total <= 80.0) {
    console.error("ERRO: O PIB de São Paulo ucrônico deveria ser muito maior devido à herança de São Vicente!");
    process.exit(1);
}
if (spUcronico.infraestrutura.modal_portuario !== 6) {
    console.error("ERRO: O Porto de São Paulo ucrônico deveria ter herdado nível 6!");
    process.exit(1);
}

// Avança 2 anos no Império Ucrônico
estadoUcronico = advanceYear(estadoUcronico);
estadoUcronico = advanceYear(estadoUcronico);
console.log(`[UCRÔNICO] Avançado +2 anos. Ano atual: ${estadoUcronico.globais.ano_atual} | Tesouro: $${estadoUcronico.globais.tesouro_nacional.toFixed(2)}`);

console.log("\n==========================================================");
console.log(" ✅ TODOS OS TESTES DE TRANSIÇÃO PASSARAM COM SUCESSO!     ");
console.log("==========================================================");
