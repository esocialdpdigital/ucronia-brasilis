import { getInitialGameState } from '../src/gameState.js';
import { advanceYear, financiarBandeiras } from '../src/simulationEngine.js';
import { checkEvents, resolverBifurcacao } from '../src/eventManager.js';

// Inicializa o estado original do jogo em 1530
let currentState = getInitialGameState();

console.log("==========================================================");
console.log("   TESTE DE ESTRESSE: MOTOR UCRONIA BRASILIS (1530-1580)  ");
console.log("==========================================================\n");

// Array para armazenar log sumarizado de eventos apenas para exibição
const historicoEventos = [];

for (let i = 0; i < 265; i++) {
    const anoAtual = currentState.globais.ano_atual;

    // --- DECISÕES POLÍTICAS DO ANO ---
    const ehCentralizador = anoAtual < 1550;
    const taxaRepasse = ehCentralizador ? 0.20 : 0.50;
    const taxaRetencao = 1.0 - taxaRepasse;

    // Ações programadas no teste para desbloquear novos eventos históricos
    if (anoAtual === 1560 || anoAtual === 1570) {
        currentState.globais.tesouro_nacional = 1000;
        currentState = financiarBandeiras(currentState);
        console.log(`  [CLI AÇÃO] Bandeiras financiadas! Investimento acumulado: ${currentState.globais.investimento_exploracao}`);
    }
    if (anoAtual === 1565) {
        const sv = currentState.estados.find(e => e.id === "sao_vicente");
        if (sv) sv.infraestrutura.modal_rodoviario = 3;
        console.log(`  [CLI AÇÃO] Estradas de São Vicente forçadas para Nível 3 para testar o Ouro.`);
    }
    if (anoAtual === 1675) {
        const pe = currentState.estados.find(e => e.id === "pernambuco");
        if (pe) {
            pe.economia.pib_total = 200;
            pe.defesa.indice_revolta = 30;
        }
    }
    if (anoAtual === 1785) {
        const sv = currentState.estados.find(e => e.id === "sao_vicente");
        if (sv) {
            sv.pacto_federativo.aliquota_imposto = 0.25;
            sv.defesa.indice_revolta = 40;
        }
    }


    currentState.estados.forEach(estado => {
        // Ignoramos a zeragem de impostos por revolta, apenas sobrecrevemos a política de união para fins de teste,
        // mas mantemos as regras orgânicas rodando
        estado.pacto_federativo.repasse_estado = taxaRepasse;
        estado.pacto_federativo.retencao_uniao = taxaRetencao;
    });

    // --- 1. MOTOR MATEMÁTICO: Processa 1 ano ---
    currentState = advanceYear(currentState);
    const anoProcessado = currentState.globais.ano_atual; // Será 1531 a 1580
    
    // --- 2. GERENCIADOR DE EVENTOS: Avalia as mutações ---
    // Mantendo uma cópia antes dos eventos para saber se algo disparou
    const estadoPreEventos = JSON.stringify(currentState);
    currentState = checkEvents(currentState);
    
    // Resolve bifurcações automaticamente (simulando jogador escolhendo a primeira opção)
    if (currentState.globais.eventos_pendentes_bifurcacao && currentState.globais.eventos_pendentes_bifurcacao.length > 0) {
        while (currentState.globais.eventos_pendentes_bifurcacao.length > 0) {
            const ev = currentState.globais.eventos_pendentes_bifurcacao[0];
            const op = ev.opcoes[0];
            console.log(`  [CLI DECISÃO] Evento: ${ev.nome} -> Escolha automática: "${op.texto}"`);
            currentState = resolverBifurcacao(currentState, ev.id, op.id);
            historicoEventos.push(`[Decisão] Ano ${anoProcessado}: ${ev.nome} -> Escolhido "${op.texto}"`);
        }
    }
    
    // Pequena verificação heurística pra saber se um evento automático ou de consequência disparou
    if (estadoPreEventos !== JSON.stringify(currentState) && !historicoEventos.some(h => h.includes(`Ano ${anoProcessado}`))) {
        historicoEventos.push(`[!] EVENTO AUTOMÁTICO DISPARADO NO ANO ${anoProcessado}.`);
    }

    const pibTotalGlobal = currentState.estados.reduce((acc, est) => acc + est.economia.pib_total, 0);
    const exibicaoCompacta = anoProcessado % 50 === 0 || i === 264;
    
    if (exibicaoCompacta) {
        console.log(`--------------------------------------------------------------------------------`);
        console.log(`[ANO ${anoProcessado}] Política de Repasse: ${taxaRepasse * 100}% | Tesouro da União: $${currentState.globais.tesouro_nacional.toFixed(2)} | PIB Nacional: $${pibTotalGlobal.toFixed(2)}`);
        
        const tabelaConsole = currentState.estados.map(estado => {
            const estaEmRevolta = estado.defesa.indice_revolta >= 70;
            return {
                "Capitania": estado.nome.replace("Capitania ", "").replace("da ", ""),
                "PIB Local": `$${estado.economia.pib_total.toFixed(2)}`,
                "Revolta": `${estado.defesa.indice_revolta.toFixed(0)}%`,
                "Status": estaEmRevolta ? "🔥 REBELADO" : (estado.penalidade_ativa ? "⚠️ CRISE" : "✔️ PACIFICADO")
            };
        });
        console.table(tabelaConsole);
    } else {
        if (anoProcessado % 10 === 0) {
            console.log(`[Progresso] Ano ${anoProcessado} - Tesouro: $${currentState.globais.tesouro_nacional.toFixed(1)} - PIB: $${pibTotalGlobal.toFixed(1)}`);
        }
    }
}

console.log("\n==========================================================");
console.log("                 RESUMO DE EVENTOS OCORRIDOS               ");
console.log("==========================================================");
if (historicoEventos.length === 0) {
    console.log("Nenhum evento grave registrado. A paz reinou na colônia.");
} else {
    historicoEventos.forEach(ev => console.log(ev));
}
console.log("==========================================================\n");
