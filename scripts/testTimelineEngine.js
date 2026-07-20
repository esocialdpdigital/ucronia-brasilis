/**
 * testTimelineEngine.js
 * 
 * Testes automatizados do Motor Inteligente de Eventos (Timeline Engine):
 * 1. Inicialização da fila de eventos futuros.
 * 2. Poda (Pruning) de eventos impossíveis.
 * 3. Deslocamento (Shifting) por instabilidade respeitando Inércia Histórica.
 * 4. Injeção Ucrônica (Injection) quando a divergência atinge limites.
 * 5. Geração de previsões para o Painel de Rumores.
 */

import { getInitialGameState } from '../src/gameState.js';
import { advanceYear } from '../src/simulationEngine.js';
import { evaluateTimeline, getUpcomingEvents } from '../src/timelineEngine.js';

console.log('=== TESTE AUTOMATIZADO: TIMELINE ENGINE (CÉREBRO DO JOGO) ===\n');

// 1. Teste de Inicialização
let state = getInitialGameState('bahia', 'comerciante');
state = evaluateTimeline(state);

console.log('1. Fila de eventos futuros inicializada com:', state.globais.eventos_futuros.length, 'eventos.');
if (state.globais.eventos_futuros.length < 10) {
    console.error('ERRO! Fila de eventos futuros muito pequena.');
    process.exit(1);
}

// 2. Teste de Previsões (Painel de Rumores)
const rumoresIniciais = getUpcomingEvents(state, 3);
console.log('2. Rumores Iniciais (Próximos 3 eventos):');
rumoresIniciais.forEach(r => console.log(`   - ${r.nome} (${r.estimativa})`));

if (rumoresIniciais.length === 0) {
    console.error('ERRO! Nenhum rumor retornado.');
    process.exit(1);
}

// 3. Teste de Poda (Pruning)
state.globais.independencia_ocorreu = true; // Simula independência ocorrida antecipadamente
state = evaluateTimeline(state);
const eventoIndependenciaNaFila = state.globais.eventos_futuros.some(e => e.condicao && e.condicao.independencia_nao_ocorreu);
console.log('3. Poda de eventos colonial-dependentes:', eventoIndependenciaNaFila ? 'FALHOU (evento permaneceu)' : 'OK (Evento podado da fila)');

if (eventoIndependenciaNaFila) {
    console.error('ERRO! Eventos podados continuam na fila.');
    process.exit(1);
}

// 4. Teste de Deslocamento com Inércia (Shifting)
let stateCrise = getInitialGameState('bahia', 'comerciante');
stateCrise.globais.divergencia_atual = 0.35; // Alta divergência
stateCrise.estados.forEach(e => e.defesa.indice_revolta = 60); // Alta revolta nacional
stateCrise = evaluateTimeline(stateCrise);

const eventoDeslocado = stateCrise.globais.eventos_futuros.find(e => e.deslocado);
console.log('4. Deslocamento por instabilidade (Shifting):', eventoDeslocado ? `OK ('${eventoDeslocado.nome}' antecipado para ano ${eventoDeslocado.ano_target})` : 'FALHOU');

if (!eventoDeslocado) {
    console.error('ERRO! Nenhum evento foi antecipado na crise.');
    process.exit(1);
}

// 5. Teste de Injeção Ucrônica
let stateUcronico = getInitialGameState('bahia', 'comerciante');
stateUcronico.globais.ano_atual = 1720;
stateUcronico.globais.divergencia_atual = 0.40; // Divergência acima do limite
stateUcronico = evaluateTimeline(stateUcronico);

const eventoInjetado = stateUcronico.globais.eventos_futuros.find(e => e.is_ucronico_puro);
console.log('5. Injeção Ucrônica:', eventoInjetado ? `OK ('${eventoInjetado.nome}' injetado para ${eventoInjetado.ano_target})` : 'FALHOU');

if (!eventoInjetado) {
    console.error('ERRO! Nenhum evento ucrônico foi injetado com alta divergência.');
    process.exit(1);
}

console.log('\n=== TODOS OS 5 TESTES DO TIMELINE ENGINE PASSARAM ✓ ===');
process.exit(0);
