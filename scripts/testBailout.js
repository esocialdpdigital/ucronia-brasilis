import { getInitialGameState, transitionToEra } from '../src/gameState.js';
import { advanceYear, solicitarSocorroRegio, solicitarEmprestimoLondres } from '../src/simulationEngine.js';

console.log("==========================================================");
console.log("      TESTE DE BAILOUT: SOCORRO RÉGIO E EMPRÉSTIMO       ");
console.log("==========================================================\n");

// 1. Testar Socorro Régio (Colonial)
console.log("1. Testando Socorro Régio (Era Colonial)...");
let stateColonial = getInitialGameState();
stateColonial.globais.tesouro_nacional = 20.0; // Simulando tesouro baixo
console.log(`  Tesouro Inicial: $${stateColonial.globais.tesouro_nacional} Contos`);
console.log(`  Revolta Bahia Inicial: ${stateColonial.estados.find(e => e.id === 'bahia').defesa.indice_revolta}%`);
console.log(`  Retenção União Bahia Inicial: ${stateColonial.estados.find(e => e.id === 'bahia').pacto_federativo.retencao_union || 0.85}`);

stateColonial = solicitarSocorroRegio(stateColonial);

const bahiaCol = stateColonial.estados.find(e => e.id === 'bahia');
console.log(`  -> Tesouro Pós-Socorro: $${stateColonial.globais.tesouro_nacional} Contos (Esperado: 420.0)`);
console.log(`  -> Revolta Bahia Pós-Socorro: ${bahiaCol.defesa.indice_revolta}% (Esperado: 35.0)`);
console.log(`  -> Retenção União Bahia Pós-Socorro: ${bahiaCol.pacto_federativo.retencao_uniao.toFixed(2)} (Esperado: 0.90)`);
console.log(`  -> Penalidades Ativas: ${JSON.stringify(stateColonial.globais.penalidades_ativas)}`);

if (stateColonial.globais.tesouro_nacional !== 420.0) {
    console.error("FAIL: Tesouro incorreto!");
    process.exit(1);
}
if (bahiaCol.defesa.indice_revolta !== 35) {
    console.error("FAIL: Revolta incorreta!");
    process.exit(1);
}
if (stateColonial.globais.penalidades_ativas.length === 0 || stateColonial.globais.penalidades_ativas[0].valor !== -15.0) {
    console.error("FAIL: Penalidade de juros não registrada!");
    process.exit(1);
}

// Rodar advanceYear e ver se o juros de -15 contos é cobrado
console.log("\nRodando advanceYear (Colonial) para verificar cobrança de juros...");
const tesouroAntesAvanco = stateColonial.globais.tesouro_nacional;
stateColonial = advanceYear(stateColonial);
console.log(`  -> Tesouro após 1 ano: $${stateColonial.globais.tesouro_nacional.toFixed(2)}`);
console.log(`  -> Duração restante do empréstimo: ${stateColonial.globais.penalidades_ativas[0].duracao_anos} anos`);

// 2. Testar Empréstimo de Londres (Império)
console.log("\n2. Testando Empréstimo de Londres (Era Imperial)...");
let stateImperial = getInitialGameState();
stateImperial = transitionToEra(stateImperial, "imperio", "canonica");
stateImperial.globais.tesouro_nacional = 10.0; // Simulando tesouro baixo
console.log(`  Tesouro Imperial Inicial: $${stateImperial.globais.tesouro_nacional} Contos`);

// Pegar PIB inicial de província para ver se diminui o crescimento
const spPibInicial = stateImperial.estados.find(e => e.id === 'sao_paulo').economia.pib_total;
console.log(`  PIB São Paulo Inicial: $${spPibInicial}`);

stateImperial = solicitarEmprestimoLondres(stateImperial);
console.log(`  -> Tesouro Pós-Empréstimo: $${stateImperial.globais.tesouro_nacional} Contos (Esperado: 610.0)`);
console.log(`  -> Penalidades Ativas: ${JSON.stringify(stateImperial.globais.penalidades_ativas)}`);

if (stateImperial.globais.tesouro_nacional !== 610.0) {
    console.error("FAIL: Tesouro Imperial incorreto!");
    process.exit(1);
}

// Avançar ano e verificar PIB de São Paulo com dreno de Londres
stateImperial = advanceYear(stateImperial);
const spPibComDreno = stateImperial.estados.find(e => e.id === 'sao_paulo').economia.pib_total;
console.log(`  -> PIB São Paulo pós 1 ano (com dreno): $${spPibComDreno.toFixed(2)}`);

console.log("\n==========================================================");
console.log("       TESTES REALIZADOS COM SUCESSO ABSOLUTO!            ");
console.log("==========================================================");
