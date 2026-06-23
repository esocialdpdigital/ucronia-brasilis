import { getInitialGameState, transitionToEra } from '../src/gameState.js';
import { advanceYear, financiarBandeiras, capturarSnapshot } from '../src/simulationEngine.js';
import { checkEvents, resolverBifurcacao } from '../src/eventManager.js';
import * as fs from 'fs';
import * as path from 'path';

const decisoes_canonicas_colonia = {
    "governo_geral_1548": "centralizar",
    "fundacao_sp_1554": "focar_catequese",
    "franca_antartica_1555": "expulsar_militarmente",
    "guerra_tamoios_1556": "armisticio_iperoig",
    "uniao_iberica_1580": "aceitar_uniao",
    "invasao_salvador_1624": "resistencia_armada_salvador",
    "invasao_holandesa_1630": "resistencia_armada",
    "quilombo_palmares": "destruir_militarmente",
    "ciclo_ouro_1693": "quinto_e_fundicao",
    "inconfidencia_mineira_1789": "devassa_forca"
};

const decisoes_canonicas_imperio = {
    "cabanagem_1835": "esmagar_cabanagem",
    "farroupilha_1835": "combate_militar_farroupilha",
    "sabinada_1837": "cercar_salvador",
    "balaiada_1838": "enviar_caxias",
    "guerra_paraguai_1864": "recrutamento_voluntario",
    "lei_aurea_1888": "proclamar_lei_aurea"
};

// Inicializa o estado original do jogo em 1530
let currentState = getInitialGameState();
const snapshots_colonia = [];

// Captura o snapshot inicial de 1530
snapshots_colonia.push(capturarSnapshot(currentState));

console.log("Iniciando simulação histórica canônica Colonial (1530-1822)...");

while (currentState.globais.ano_atual < 1822 && !currentState.globais.fim_da_era) {
    const anoAnterior = currentState.globais.ano_atual;
    
    // Simula as ações canônicas adicionais necessárias para os gatilhos:
    const ehCentralizador = anoAnterior < 1548;
    const taxaRepasse = ehCentralizador ? 0.20 : 0.50;
    const taxaRetencao = 1.0 - taxaRepasse;
    currentState.estados.forEach(estado => {
        estado.pacto_federativo.repasse_estado = taxaRepasse;
        estado.pacto_federativo.retencao_uniao = taxaRetencao;
        
        if (estado.defesa.indice_revolta > 30) {
            estado.defesa.indice_revolta = 20;
        }
    });

    if (anoAnterior === 1600 || anoAnterior === 1610) {
        currentState.globais.tesouro_nacional = 1000;
        currentState = financiarBandeiras(currentState);
        console.log(`  [AÇÃO HISTÓRICA] Financiar bandeiras no ano ${anoAnterior}. Investimento: ${currentState.globais.investimento_exploracao}`);
    }

    currentState = advanceYear(currentState);
    const anoAtual = currentState.globais.ano_atual;

    currentState = checkEvents(currentState);

    if (currentState.globais.eventos_pendentes_bifurcacao && currentState.globais.eventos_pendentes_bifurcacao.length > 0) {
        while (currentState.globais.eventos_pendentes_bifurcacao.length > 0) {
            const ev = currentState.globais.eventos_pendentes_bifurcacao[0];
            const opcaoCorreta = decisoes_canonicas_colonia[ev.id];
            
            if (opcaoCorreta) {
                console.log(`  [DECISÃO CANÔNICA COLONIAL] Ano ${anoAtual} - Evento: ${ev.nome} -> Escolha: "${opcaoCorreta}"`);
                currentState = resolverBifurcacao(currentState, ev.id, opcaoCorreta);
            } else {
                const fallbackOpcao = ev.opcoes[0].id;
                console.log(`  [DECISÃO FALLBACK] Ano ${anoAtual} - Evento: ${ev.nome} -> Escolha: "${fallbackOpcao}"`);
                currentState = resolverBifurcacao(currentState, ev.id, fallbackOpcao);
            }
        }
    }

    if (anoAtual % 5 === 0 || anoAtual === 1822) {
        snapshots_colonia.push(capturarSnapshot(currentState));
    }
}

console.log("Resolvendo Independência em 1822...");
currentState = checkEvents(currentState);
currentState = resolverBifurcacao(currentState, "independencia_1822", "proclamar_dom_pedro");

console.log("Transicionando para a Era Imperial (Caminho Canônico)...");
currentState = transitionToEra(currentState, "imperio", "canonica");

const snapshots_imperio = [];
snapshots_imperio.push(capturarSnapshot(currentState));

console.log("Iniciando simulação histórica canônica do Império (1822-1889)...");

while (currentState.globais.ano_atual < 1889 && !currentState.globais.fim_da_era) {
    const anoAnterior = currentState.globais.ano_atual;
    
    // Mantém a revolta controlada para simular governação real
    currentState.estados.forEach(estado => {
        if (estado.defesa.indice_revolta > 30) {
            estado.defesa.indice_revolta = 20;
        }
    });

    currentState = advanceYear(currentState);
    const anoAtual = currentState.globais.ano_atual;

    currentState = checkEvents(currentState);

    if (currentState.globais.eventos_pendentes_bifurcacao && currentState.globais.eventos_pendentes_bifurcacao.length > 0) {
        while (currentState.globais.eventos_pendentes_bifurcacao.length > 0) {
            const ev = currentState.globais.eventos_pendentes_bifurcacao[0];
            const opcaoCorreta = decisoes_canonicas_imperio[ev.id];
            
            if (opcaoCorreta) {
                console.log(`  [DECISÃO CANÔNICA IMPÉRIO] Ano ${anoAtual} - Evento: ${ev.nome} -> Escolha: "${opcaoCorreta}"`);
                currentState = resolverBifurcacao(currentState, ev.id, opcaoCorreta);
            } else {
                const fallbackOpcao = ev.opcoes[0].id;
                console.log(`  [DECISÃO FALLBACK IMPÉRIO] Ano ${anoAtual} - Evento: ${ev.nome} -> Escolha: "${fallbackOpcao}"`);
                currentState = resolverBifurcacao(currentState, ev.id, fallbackOpcao);
            }
        }
    }

    if (anoAtual % 5 === 0 || anoAtual === 1889) {
        snapshots_imperio.push(capturarSnapshot(currentState));
    }
}

console.log(`Simulação concluída com sucesso! snapshots Colonial: ${snapshots_colonia.length} | snapshots Império: ${snapshots_imperio.length}`);

// Formata o arquivo JS
const fileContent = `// Gerado automaticamente por gerarHistoriaCanonica.js. Não edite manualmente.
export const historiaCanonica = {
    colonial: {
        snapshots: ${JSON.stringify(snapshots_colonia, null, 4)},
        decisoes_canonicas: {
            "governo_geral_1548": "centralizar",
            "franca_antartica_1555": "expulsar_militarmente",
            "invasao_salvador_1624": "resistencia_armada_salvador",
            "invasao_holandesa_1630": "resistencia_armada",
            "quilombo_palmares": "destruir_militarmente",
            "ciclo_ouro_1693": "quinto_e_fundicao",
            "inconfidencia_mineira_1789": "devassa_forca"
        }
    },
    imperio: {
        snapshots: ${JSON.stringify(snapshots_imperio, null, 4)},
        decisoes_canonicas: {
            "cabanagem_1835": "esmagar_cabanagem",
            "farroupilha_1835": "combate_militar_farroupilha",
            "sabinada_1837": "cercar_salvador",
            "balaiada_1838": "enviar_caxias",
            "guerra_paraguai_1864": "recrutamento_voluntario",
            "lei_aurea_1888": "proclamar_lei_aurea"
        }
    }
};
`;

const destPath = path.join('data', 'historia_canonica.js');
fs.writeFileSync(destPath, fileContent, 'utf-8');
console.log(`Arquivo gravado em: ${destPath}`);
