/**
 * testRepublica.js
 * Testa a transição para a Era República Confederada (Fase 3)
 */
import { getInitialGameState, transitionToEra } from '../src/gameState.js';
import { advanceYear } from '../src/simulationEngine.js';

console.log('=== TESTE FASE 3: REPÚBLICA CONFEDERADA ===\n');

// Setup inicial acelerado
let state = getInitialGameState('bahia', 'comerciante');
state.globais.ano_atual = 1821;
state.globais.independencia_ocorreu = false;

// Testa a transição para república
const stateRepublica = transitionToEra(state, 'republica', 'ucronica');

console.log('1. Era:', stateRepublica.globais.era_atual);
console.log('2. Forma de Governo:', stateRepublica.globais.forma_governo);
console.log('3. Ano Inicial:', stateRepublica.globais.ano_atual);
console.log('4. Tesouro herdado:', stateRepublica.globais.tesouro_nacional.toFixed(2), 'Contos');
console.log('5. Provincias:', stateRepublica.estados.length);

const prov0 = stateRepublica.estados[0];
console.log('6. Retencao Uniao:', (prov0.pacto_federativo.retencao_uniao * 100).toFixed(0) + '%');
console.log('7. Repasse Estado:', (prov0.pacto_federativo.repasse_estado * 100).toFixed(0) + '%');

const logRepublica = stateRepublica.globais.eventLog.find(l => l.tipo === 'independencia');
console.log('8. Log Independencia:', logRepublica ? 'OK' : 'AUSENTE - ERRO!');

// Avanca 5 anos
let stR = stateRepublica;
for (let i = 0; i < 5; i++) {
    stR = advanceYear(stR);
}

const mediaRevolta = stR.estados.reduce((a, e) => a + e.defesa.indice_revolta, 0) / stR.estados.length;
console.log('\n--- Apos 5 anos ---');
console.log('9. Ano:', stR.globais.ano_atual);
console.log('10. Tesouro:', stR.globais.tesouro_nacional.toFixed(2));
console.log('11. Revolta Media:', mediaRevolta.toFixed(1) + '%');
console.log('12. era_atual:', stR.globais.era_atual);
console.log('13. forma_governo:', stR.globais.forma_governo);

if (stR.globais.era_atual !== 'republica') process.exit(1);
if (stR.globais.forma_governo !== 'republicana') process.exit(1);

console.log('\n=== TODOS OS TESTES PASSARAM ===');
