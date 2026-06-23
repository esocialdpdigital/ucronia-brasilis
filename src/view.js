import { getInitialGameState, transitionToEra } from './gameState.js';
import { advanceYear, executeUpgrade, financiarBandeiras, aumentarDefesa, solicitarSocorroRegio, solicitarEmprestimoLondres, capturarSnapshot, calcularDivergencia, atacarTerritorio, negociarTerritorio, getUpgradeCost, getLevelLore, decretarImpostosExtraordinarios, dissolverAssembleiaGeral } from './simulationEngine.js';
import { checkEvents, resolverBifurcacao } from './eventManager.js';
import { eventosColoniais } from '../data/eventos_colonial.js';
import { capitaniasGeoJSON } from '../data/mapas/capitanias_1534_geojson.js';
import { estados1822GeoJSON } from '../data/mapas/estados_1822_geojson.js';
import { historiaCanonica } from '../data/historia_canonica.js';
import { cidadesHistoricas, rotasHistoricas } from '../data/cidades_historicas.js';
import { enciclopedia } from '../data/enciclopedia.js';
import { initAuth, loginUser, registerUser, loginAsGuest, logoutUser, saveGameState, loadGameState, saveScoreToRanking, getRankings, clearLocalRankings, authState } from './auth.js';


// Controlador de áudio dinâmico via Web Audio API (sem dependência de assets locais)
const AudioController = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    },
    
    playClick() {
        if (!currentState.globais.settings || !currentState.globais.settings.audioEnabled) return;
        this.init();
        if (!this.ctx) return;
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            const now = this.ctx.currentTime;
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            
            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {
            console.error("Erro ao tocar som de clique:", e);
        }
    },
    
    playTurn() {
        if (!currentState.globais.settings || !currentState.globais.settings.audioEnabled) return;
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            
            // Nota 1 (ding)
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(330, now);
            gain1.gain.setValueAtTime(0.15, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc1.start(now);
            osc1.stop(now + 0.18);
            
            // Nota 2 (dong)
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(440, now + 0.1);
            gain2.gain.setValueAtTime(0.15, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.3);
        } catch (e) {
            console.error("Erro ao tocar som de turno:", e);
        }
    },
    
    playEvent() {
        if (!currentState.globais.settings || !currentState.globais.settings.audioEnabled) return;
        this.init();
        if (!this.ctx) return;
        
        try {
            const now = this.ctx.currentTime;
            const notes = [440, 554, 659, 880];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.type = 'sine';
                
                const startTime = now + (idx * 0.08);
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.2);
                
                osc.start(startTime);
                osc.stop(startTime + 0.2);
            });
        } catch (e) {
            console.error("Erro ao tocar som de evento:", e);
        }
    }
};

// Captura cliques globais em botões para emitir SFX de clique
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button') || e.target.closest('.tab-btn');
    if (btn) {
        AudioController.playClick();
    }
});

// Estado global mantido pela View (A "Fonte da Verdade" no Frontend)
let currentState = getInitialGameState();

// Referências aos nós do DOM
const anoEl = document.getElementById('ano_atual');
const tesouroEl = document.getElementById('tesouro_nacional');
const cardsContainer = document.getElementById('cards-container');
const btnAvancar = document.getElementById('btn-avancar');

// Elementos da barra de progresso da era e modal de bifurcação
const progressoEraAtualEl = document.getElementById('progresso-era-atual');
const eraBarraPreenchimentoEl = document.getElementById('era-barra-preenchimento');
const modalEventoBifurcacaoEl = document.getElementById('modal-evento-bifurcacao');
const bifurcacaoModalContentEl = document.getElementById('bifurcacao-modal-content');

// Comportamento do Zoom D3 global
let zoomBehavior;

const limitesEras = {
    colonial: { inicio: 1530, fim: 1822 },
    imperio: { inicio: 1822, fim: 1889 },
    republica: { inicio: 1889, fim: 1988 }
};

// Filtro regional ativo unificado
let filtroRegiaoAtual = 'todos';

/**
 * Exibe uma notificação toast personalizada na tela.
 * @param {string} htmlContent - O conteúdo HTML do toast
 * @param {number} duration - Duração em milissegundos
 */
function mostrarToast(htmlContent, duration = 4000) {
    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.getElementById('toast-message');
    if (toastContainer && toastMessage) {
        toastMessage.innerHTML = htmlContent;
        toastContainer.style.display = 'block';
        if (window.toastTimeout) {
            clearTimeout(window.toastTimeout);
        }
        window.toastTimeout = setTimeout(() => {
            toastContainer.style.display = 'none';
        }, duration);
    }
}

/**
 * Cria a estrutura inicial dos cartões baseado nos estados presentes no GameState.
 * @param {Object} state - O estado do jogo
 */
function createCards(state) {
    // Preserva o painel de filtro ao re-criar os cartões
    const filtroEl = document.getElementById('filtro-regioes');
    cardsContainer.innerHTML = '';
    if (filtroEl) cardsContainer.appendChild(filtroEl);

    state.estados.forEach(estado => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${estado.id}`;
        // Atributo usado pelo filtro regional
        if (estado.regiao) card.dataset.regiao = estado.regiao;

        const statusTerr = estado.status_territorio || "controlado";
        const isInacessivel = statusTerr !== "controlado";

        let statusLabel = '';
        if (statusTerr === 'invadido') statusLabel = `🏴 INVADIDO (${estado.invadido_por || 'inimigo'}) — ${estado.duracao_invasao} anos restantes`;
        else if (statusTerr === 'rebelado') statusLabel = '🔥 REBELADO — Controle perdido';
        else if (statusTerr === 'independente') statusLabel = '🟣 INDEPENDENTE';

        const nivelPorto = estado.infraestrutura.modal_portuario;
        const nivelEstrada = estado.infraestrutura.modal_rodoviario;
        const nivelMilicia = estado.defesa.milicia_local;

        const custoPorto = getUpgradeCost(nivelPorto, 'modal_portuario');
        const custoEstrada = getUpgradeCost(nivelEstrada, 'modal_rodoviario');
        const custoMilicia = getUpgradeCost(nivelMilicia, 'milicia_local');

        const lorePorto = getLevelLore(nivelPorto, 'modal_portuario', state.globais.era_atual);
        const loreEstrada = getLevelLore(nivelEstrada, 'modal_rodoviario', state.globais.era_atual);
        const loreMilicia = getLevelLore(nivelMilicia, 'milicia_local', state.globais.era_atual);

        const proximoLorePorto = nivelPorto < 5 ? getLevelLore(nivelPorto + 1, 'modal_portuario', state.globais.era_atual) : "Máximo";
        const proximoLoreEstrada = nivelEstrada < 5 ? getLevelLore(nivelEstrada + 1, 'modal_rodoviario', state.globais.era_atual) : "Máximo";
        const proximoLoreMilicia = nivelMilicia < 5 ? getLevelLore(nivelMilicia + 1, 'milicia_local', state.globais.era_atual) : "Máximo";

        let btnPortoHTML = '';
        if (nivelPorto === 0) {
            btnPortoHTML = `<button class="btn-upgrade" disabled style="margin-top: 15px; padding: 10px; font-size: 13px; opacity: 0.5;" data-tooltip-game="⚓ Sem acesso ao mar neste território.">Sem Acesso ao Mar</button>`;
        } else if (nivelPorto >= 5) {
            btnPortoHTML = `<button class="btn-upgrade" disabled style="margin-top: 15px; padding: 10px; font-size: 13px; opacity: 0.7;">⚓ Porto no Máximo</button>`;
        } else {
            btnPortoHTML = `<button class="btn-upgrade" data-estado="${estado.id}" data-modal="modal_portuario"
                data-tooltip-game="⚓ &lt;strong&gt;Melhorar Porto&lt;/strong&gt;&lt;br&gt;Evolui de &lt;em&gt;${lorePorto}&lt;/em&gt; para &lt;strong&gt;${proximoLorePorto}&lt;/strong&gt;. Aumenta a capacidade de exportação comercial desta capitania, impulsionando o crescimento do PIB.&lt;br&gt;&lt;br&gt;💰 Custo: $${custoPorto} Contos."
                style="margin-top: 15px; padding: 10px; font-size: 13px;">+ Melhorar Porto (${custoPorto})</button>`;
        }

        let btnEstradaHTML = '';
        if (nivelEstrada >= 5) {
            btnEstradaHTML = `<button class="btn-upgrade" disabled style="margin-top: 5px; padding: 10px; font-size: 13px; opacity: 0.7;">🚧 Estrada no Máximo</button>`;
        } else {
            btnEstradaHTML = `<button class="btn-upgrade" data-estado="${estado.id}" data-modal="modal_rodoviario"
                data-tooltip-game="🚧 &lt;strong&gt;Melhorar Estradas&lt;/strong&gt;&lt;br&gt;Evolui de &lt;em&gt;${loreEstrada}&lt;/em&gt; para &lt;strong&gt;${proximoLoreEstrada}&lt;/strong&gt;. Reduz isolamento, permitindo a exploração e escoamento do interior.&lt;br&gt;&lt;br&gt;💰 Custo: $${custoEstrada} Contos."
                style="margin-top: 5px; padding: 10px; font-size: 13px;">+ Melhorar Estradas (${custoEstrada})</button>`;
        }

        let btnMiliciaHTML = '';
        if (nivelMilicia >= 5) {
            btnMiliciaHTML = `<button class="btn-upgrade" disabled style="margin-top: 5px; padding: 10px; font-size: 13px; opacity: 0.7; background-color: var(--panel-border); color: var(--text-color);">🛡️ Defesa no Máximo</button>`;
        } else {
            btnMiliciaHTML = `<button class="btn-upgrade" data-estado="${estado.id}" data-modal="milicia_local"
                data-tooltip-game="🛡️ &lt;strong&gt;Aumentar Defesa&lt;/strong&gt;&lt;br&gt;Evolui de &lt;em&gt;${loreMilicia}&lt;/em&gt; para &lt;strong&gt;${proximoLoreMilicia}&lt;/strong&gt;. Contrata forças locais para combater revoltas e invasões.&lt;br&gt;&lt;br&gt;💰 Custo: $${custoMilicia} Contos."
                style="margin-top: 5px; padding: 10px; font-size: 13px; background-color: #f38ba8; color: #11111b;">+ Aumentar Defesa (${custoMilicia})</button>`;
        }

        let controlsHTML = '';
        if (isInacessivel) {
            controlsHTML = `
            <div class="territorio-inacessivel" style="margin-top: 15px; padding: 15px; border-radius: 8px; border: 2px dashed ${statusTerr === 'invadido' ? '#1a3a6b' : '#7b0000'}; background: ${statusTerr === 'invadido' ? 'rgba(26,58,107,0.15)' : 'rgba(123,0,0,0.15)'}; text-align: center;">
                <p style="font-weight: bold; color: ${statusTerr === 'invadido' ? '#89b4fa' : '#f38ba8'}; margin: 0 0 8px 0; font-size: 13px;">${statusLabel}</p>
                <p style="font-size: 11px; opacity: 0.8; margin: 0 0 12px 0;">Os controles normais estão bloqueados. Escolha uma ação para recuperar o território:</p>
                <button class="btn-atacar-territorio" data-estado="${estado.id}" style="width: 100%; padding: 10px; margin-bottom: 6px; background: #f38ba8; color: #11111b; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit; font-size: 13px;">⚔️ Atacar (250 Contos)</button>
                <button class="btn-negociar-territorio" data-estado="${estado.id}" style="width: 100%; padding: 10px; background: #89b4fa; color: #11111b; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit; font-size: 13px;">🤝 Negociar (aceitar perdas)</button>
            </div>
            `;
        } else {
            controlsHTML = `
            <div class="control-group">
                <label
                    data-tooltip-game="⚖️ &lt;strong&gt;Repasse Estadual&lt;/strong&gt;&lt;br&gt;Define quanto da arrecadação fica no estado. &lt;br&gt;• &lt;strong&gt;Alto repasse (acima de 50%)&lt;/strong&gt;: mais lealdade local, menos revolta, mas menos receita para a União.&lt;br&gt;• &lt;strong&gt;Baixo repasse (abaixo de 30%)&lt;/strong&gt;: mais receita federal, porém a revolta cresce rapidamente."
                >Repasse Estadual: <strong id="label-repasse-${estado.id}">${(estado.pacto_federativo.repasse_estado * 100).toFixed(0)}</strong>%</label>
                <input type="range" class="slider repasse-slider" data-estado="${estado.id}" min="0" max="100" value="${estado.pacto_federativo.repasse_estado * 100}">
            </div>
            ${btnPortoHTML}
            ${btnEstradaHTML}
            ${btnMiliciaHTML}
            `;
        }
        
        card.innerHTML = `
            <h3>${estado.nome}</h3>
            ${estado.donatario ? `<small style="opacity:0.6; font-size:11px;">Donatário: ${estado.donatario}</small>` : ''}
            <div data-tooltip-game="💰 &lt;strong&gt;Produto Interno Bruto Local&lt;/strong&gt;&lt;br&gt;Representa a riqueza total gerada nesta região. O PIB cresce a cada ano dependendo de portos, estradas, ciclos econômicos e da estabilidade local.">PIB Local: <strong id="pib-${estado.id}" style="color: #a6e3a1">$0.00</strong></div>
            <div data-tooltip-game="🔥 &lt;strong&gt;Índice de Revolta&lt;/strong&gt;&lt;br&gt;Mete o nível de insatisfação local. Se atingir 70% ou mais, o território entra em rebelião, paralisando a arrecadação de impostos. Contrate Defesa (milícias) ou aumente o Repasse Estadual para acalmar a província.">Índice Revolta: <strong id="revolta-${estado.id}">0%</strong></div>
            <div data-tooltip-game="💡 &lt;strong&gt;Status Regional&lt;/strong&gt;&lt;br&gt;• &lt;strong&gt;PACIFICADO&lt;/strong&gt;: Situação sob controle.&lt;br&gt;• &lt;strong&gt;EM CRISE&lt;/strong&gt;: Sob efeito de alguma penalidade de seca, pragas ou invasões.&lt;br&gt;• &lt;strong&gt;REBELADO&lt;/strong&gt;: O povo se insurgiu! Sem arrecadação tributária até que a ordem seja restaurada.">Status: <strong id="status-${estado.id}">✔️ PACIFICADO</strong></div>
            <div style="font-size: 11px; margin-top: 8px; border-top: 1px dashed var(--panel-border); padding-top: 8px; display: grid; grid-template-columns: 1fr; gap: 4px; line-height: 1.4;">
                <div data-tooltip-game="⚓ &lt;strong&gt;Nível do Porto&lt;/strong&gt;&lt;br&gt;Capacidade de exportação comercial.">Porto: <strong id="porto-${estado.id}">${nivelPorto === 0 ? 'Sem Acesso' : `${nivelPorto} (${lorePorto})`}</strong></div>
                <div data-tooltip-game="🚧 &lt;strong&gt;Nível das Estradas/Ferrovias&lt;/strong&gt;&lt;br&gt;Mede a capacidade de transporte interno.">Estradas: <strong id="estradas-${estado.id}">${nivelEstrada} (${loreEstrada})</strong></div>
                <div data-tooltip-game="🛡️ &lt;strong&gt;Nível de Defesa (Milícias)&lt;/strong&gt;&lt;br&gt;Forças locais de pacificação.">Defesa: <strong id="defesa-${estado.id}">${nivelMilicia} (${loreMilicia})</strong></div>
            </div>
            ${controlsHTML}
        `;
        cardsContainer.appendChild(card);
    });

    // Escuta alterações do usuário no Slider em tempo real apenas para atualizar a UI (Texto)
    document.querySelectorAll('.repasse-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const val = e.target.value;
            const estadoId = e.target.dataset.estado;
            const label = document.getElementById(`label-repasse-${estadoId}`);
            if (label) label.innerText = val;
        });
    });

    // Escuta clique nos botões de Atacar/Negociar Território (Fase 3.0)
    document.querySelectorAll('.btn-atacar-territorio').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const estadoId = e.target.dataset.estado;
            currentState = atacarTerritorio(currentState, estadoId);
            createCards(currentState);
            updateInterface(currentState);
            try { localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState)); } catch(err) {}
        });
    });
    document.querySelectorAll('.btn-negociar-territorio').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const estadoId = e.target.dataset.estado;
            currentState = negociarTerritorio(currentState, estadoId);
            createCards(currentState);
            updateInterface(currentState);
            try { localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState)); } catch(err) {}
        });
    });

    // Escuta clique nos botões de Upgrade
    document.querySelectorAll('.btn-upgrade').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const estadoId = e.target.dataset.estado;
            const modal = e.target.dataset.modal;
            if (!estadoId || !modal) return;

            const estado = currentState.estados.find(e => e.id === estadoId);
            if (!estado) return;

            const nivelAtual = modal === 'milicia_local' ? estado.defesa.milicia_local : estado.infraestrutura[modal];
            const custo = getUpgradeCost(nivelAtual, modal);

            if (custo === Infinity) {
                mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> Limite máximo de nível atingido ou indisponível.`);
                return;
            }

            if (currentState.globais.tesouro_nacional < custo) {
                mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> Tesouro insuficiente! Necessário $${custo} Contos de Réis.`);
                return;
            }

            if (modal === 'milicia_local') {
                currentState = aumentarDefesa(currentState, estadoId);
                const estadoNovo = currentState.estados.find(e => e.id === estadoId);
                const lore = getLevelLore(estadoNovo.defesa.milicia_local, 'milicia_local', currentState.globais.era_atual);
                mostrarToast(`<strong style="color: #a6e3a1;">Sucesso:</strong> Defesa aumentada para nível ${estadoNovo.defesa.milicia_local} (${lore}) em ${estadoNovo.nome}.`);
            } else {
                currentState = executeUpgrade(currentState, estadoId, modal);
                const estadoNovo = currentState.estados.find(e => e.id === estadoId);
                const nivel = estadoNovo.infraestrutura[modal];
                const lore = getLevelLore(nivel, modal, currentState.globais.era_atual);
                const nomeUpgrade = modal === 'modal_portuario' ? 'Porto' : 'Estrada';
                mostrarToast(`<strong style="color: #a6e3a1;">Sucesso:</strong> ${nomeUpgrade} melhorado para nível ${nivel} (${lore}) em ${estadoNovo.nome}.`);
            }
            
            createCards(currentState);
            updateInterface(currentState);
        });
    });
}

function setupFilterListeners() {
    // Filtro de Regiões: colapsa/exibe cartões por região (registrado apenas uma vez na inicialização)
    const regioes = ['todos', 'norte', 'nordeste', 'leste', 'sudeste'];
    regioes.forEach(regiao => {
        const btn = document.getElementById(`filtro-${regiao}`);
        if (!btn) return;
        btn.addEventListener('click', () => {
            // Atualiza filtro regional global
            filtroRegiaoAtual = regiao;

            // Atualiza estado visual dos botões
            regioes.forEach(r => {
                const b = document.getElementById(`filtro-${r}`);
                if (b) b.classList.remove('ativo');
            });
            btn.classList.add('ativo');

            // Filtra os cartões
            document.querySelectorAll('.card[data-regiao]').forEach(card => {
                if (regiao === 'todos' || card.dataset.regiao === regiao) {
                    card.classList.remove('filtrado-oculto');
                } else {
                    card.classList.add('filtrado-oculto');
                }
            });

            // Atualiza o mapa D3 para aplicar opacidade do filtro
            renderMapD3(currentState);
        });
    });
}

/**
 * Atualiza todos os dados textuais da interface e o mapa visual.
 * @param {Object} state - Estado mais recente
 */
/**
 * Atualiza a barra de progresso da era e insere marcadores para os eventos fixos.
 */
function atualizarProgressoEra(state) {
    const era = state.globais.era_atual;
    const limites = limitesEras[era];
    
    const progressoInicioEl = document.getElementById('progresso-era-inicio');
    const progressoFimEl = document.getElementById('progresso-era-fim');
    
    if (limites && progressoInicioEl && progressoFimEl && progressoEraAtualEl && eraBarraPreenchimentoEl) {
        progressoInicioEl.textContent = limites.inicio;
        progressoFimEl.textContent = limites.fim;
        
        const totalAnos = limites.fim - limites.inicio;
        const anosPassados = state.globais.ano_atual - limites.inicio;
        const pct = Math.max(0, Math.min(100, (anosPassados / totalAnos) * 100));
        
        progressoEraAtualEl.textContent = `Ano ${state.globais.ano_atual} (${Math.round(pct)}%)`;
        eraBarraPreenchimentoEl.style.width = `${pct}%`;
        
        // Remove marcadores antigos
        const barraBg = document.querySelector('.era-barra-bg');
        if (barraBg) {
            const marcadoresExistentes = barraBg.querySelectorAll('.era-marcador');
            marcadoresExistentes.forEach(m => m.remove());
            
            // Adiciona marcadores para os eventos da era atual
            if (era === 'colonial') {
                eventosColoniais.forEach(evt => {
                    if (evt.ano_fixo !== undefined) {
                        const evtPct = ((evt.ano_fixo - limites.inicio) / totalAnos) * 100;
                        if (evtPct >= 0 && evtPct <= 100) {
                            const marcador = document.createElement('div');
                            marcador.className = 'era-marcador';
                            if (state.globais.ano_atual > evt.ano_fixo) {
                                marcador.classList.add('passou');
                            }
                            marcador.style.left = `${evtPct}%`;
                            marcador.setAttribute('data-tooltip', `${evt.ano_fixo}: ${evt.nome}`);
                            barraBg.appendChild(marcador);
                        }
                    }
                });
            }
        }
    }
}

/**
 * Verifica se existem bifurcações de eventos pendentes e exibe o modal de escolha.
 */
function verificarEventosBifurcacao(state) {
    if (state.globais.eventos_pendentes_bifurcacao && state.globais.eventos_pendentes_bifurcacao.length > 0) {
        const evento = state.globais.eventos_pendentes_bifurcacao[0];
        
        if (bifurcacaoModalContentEl && modalEventoBifurcacaoEl) {
            const wasHidden = modalEventoBifurcacaoEl.style.display !== 'flex';

            bifurcacaoModalContentEl.innerHTML = `
                ${evento.imagem ? `<div class="evento-banner-wrapper"><img src="${evento.imagem}" alt="${evento.nome}" class="evento-banner" onerror="console.warn('Imagem não encontrada:', this.src); this.closest('.evento-banner-wrapper').style.display='none'"></div>` : ''}
                <div class="evento-corpo" style="padding: 20px 30px 30px 30px;">
                    <div class="evento-header">
                        <span class="evento-ano-badge">${evento.ano_fixo || state.globais.ano_atual}</span>
                        <h2 style="margin: 0; font-family: inherit;">${evento.nome}</h2>
                    </div>
                    <p style="margin: 15px 0; line-height: 1.5; font-size: 14px;">${evento.descricao}</p>
                    <div class="opcoes-container">
                        ${evento.opcoes.map(opcao => `
                            <button class="btn-opcao-bifurcacao" data-evento-id="${evento.id}" data-opcao-id="${opcao.id}">
                                <strong>${opcao.texto}</strong>
                                <span>${opcao.descricao}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            modalEventoBifurcacaoEl.style.display = 'flex';

            if (wasHidden) {
                AudioController.playEvent();
            }
            
            // Adiciona listeners para os botões de opção
            bifurcacaoModalContentEl.querySelectorAll('.btn-opcao-bifurcacao').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.currentTarget;
                    const eId = targetBtn.dataset.eventoId;
                    const oId = targetBtn.dataset.opcaoId;
                    
                    // Executa a resolução do evento
                    currentState = resolverBifurcacao(currentState, eId, oId);
                    
                    // Salva o jogo
                    try {
                        localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState));
                    } catch (err) {
                        console.error("Erro ao salvar após bifurcação:", err);
                    }
                    
                    // Fecha o modal
                    modalEventoBifurcacaoEl.style.display = 'none';
                    
                    // Atualiza a interface
                    updateInterface(currentState);
                });
            });
        }
    } else {
        if (modalEventoBifurcacaoEl) {
            modalEventoBifurcacaoEl.style.display = 'none';
        }
    }
}

// --- SISTEMAS DE APARÊNCIA, ABAS E LEGENDA ---

function aplicarTemaVisual(estilo) {
    if (estilo === 'moderno') {
        document.body.setAttribute('data-theme', 'moderno');
    } else {
        document.body.removeAttribute('data-theme');
    }
    const selectTheme = document.getElementById('select-theme');
    if (selectTheme) {
        selectTheme.value = estilo || 'historico';
    }
}

function setupThemeSelector() {
    const selectTheme = document.getElementById('select-theme');
    if (selectTheme) {
        selectTheme.addEventListener('change', (e) => {
            const selectedStyle = e.target.value;
            currentState.globais.config_ui.estilo_layout = selectedStyle;
            aplicarTemaVisual(selectedStyle);
            
            try {
                localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState));
            } catch (err) {
                console.error("Erro ao salvar tema:", err);
            }
        });
    }
}

function setupGameTooltips() {
    const tooltipEl = document.getElementById('game-tooltip');
    if (!tooltipEl) return;

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tooltip-game]');
        if (target) {
            const html = target.getAttribute('data-tooltip-game');
            tooltipEl.innerHTML = html;
            tooltipEl.classList.add('visivel');
        }
    });

    document.addEventListener('mousemove', (e) => {
        const target = e.target.closest('[data-tooltip-game]');
        if (target && tooltipEl.classList.contains('visivel')) {
            const tooltipWidth = tooltipEl.offsetWidth;
            const tooltipHeight = tooltipEl.offsetHeight;
            let left = e.clientX + 15;
            let top = e.clientY + 15;

            // adjust if offscreen horizontally
            if (left + tooltipWidth > window.innerWidth) {
                left = e.clientX - tooltipWidth - 15;
            }
            if (left < 0) {
                left = 5;
            }

            // adjust if offscreen vertically
            if (top + tooltipHeight > window.innerHeight) {
                top = e.clientY - tooltipHeight - 15;
            }
            if (top < 0) {
                top = 5;
            }

            tooltipEl.style.left = `${left}px`;
            tooltipEl.style.top = `${top}px`;
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-tooltip-game]');
        if (target) {
            const related = e.relatedTarget;
            if (!related || !target.contains(related)) {
                tooltipEl.classList.remove('visivel');
            }
        }
    });
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = document.getElementById(btn.dataset.tab);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

function setupZoom() {
    const svg = d3.select("#mapa-d3");
    const zoomGroup = d3.select("#map-zoom-group");

    zoomBehavior = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            zoomGroup.attr("transform", event.transform);
        });

    svg.call(zoomBehavior);

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        svg.transition().duration(300).call(zoomBehavior.scaleBy, 1 / 1.3);
    });

    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
        svg.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity);
    });
}

function atualizarLegendaMapa(era) {
    const legendEl = document.getElementById('map-legend');
    if (!legendEl) return;

    let legendHTML = `<h4>Legenda do Mapa</h4>`;

    if (era === 'colonial') {
        legendHTML += `
            <div class="legend-item"><span class="legend-icon">⭐</span> Vila / Sede</div>
            <div class="legend-item"><span class="legend-icon">⚓</span> Porto Colonial</div>
            <div class="legend-item"><span class="legend-icon line road"></span> Trilha / Estrada</div>
            <div class="legend-item"><span class="legend-icon">🛡️</span> Milícia (Nível ≥ 2)</div>
        `;
    } else if (era === 'imperio') {
        legendHTML += `
            <div class="legend-item"><span class="legend-icon">⭐</span> Capital de Província</div>
            <div class="legend-item"><span class="legend-icon">⚓</span> Porto Imperial</div>
            <div class="legend-item"><span class="legend-icon line road"></span> Estrada Imperial</div>
            <div class="legend-item"><span class="legend-icon line railroad"></span> Ferrovia</div>
            <div class="legend-item"><span class="legend-icon">🛡️</span> Guarda Nacional (Nível ≥ 2)</div>
        `;
    } else {
        legendHTML += `
            <div class="legend-item"><span class="legend-icon">⭐</span> Capital de Estado</div>
            <div class="legend-item"><span class="legend-icon">⚓</span> Porto Comercial</div>
            <div class="legend-item"><span class="legend-icon line road" style="border-top-style: solid;"></span> Rodovia Pavimentada</div>
            <div class="legend-item"><span class="legend-icon line railroad"></span> Linha Férrea</div>
            <div class="legend-item"><span class="legend-icon">🛡️</span> Base Militar (Nível ≥ 2)</div>
        `;
    }

    legendEl.innerHTML = legendHTML;
}

function atualizarAbaEconomia(state) {
    const pibTotalEl = document.getElementById('pib-nacional-total');
    const revoltaMediaEl = document.getElementById('revolta-media-nacional');
    const tableBodyEl = document.getElementById('economia-table-body');

    if (!pibTotalEl || !revoltaMediaEl || !tableBodyEl) return;

    const pibNacional = state.estados.reduce((acc, e) => acc + e.economia.pib_total, 0);
    const revoltaMedia = state.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / state.estados.length;

    pibTotalEl.innerText = `$${pibNacional.toFixed(2)} Contos`;
    revoltaMediaEl.innerText = `${revoltaMedia.toFixed(1)}%`;

    tableBodyEl.innerHTML = state.estados.map(estado => {
        const estaEmRevolta = estado.defesa.indice_revolta >= 70;
        const statusText = estaEmRevolta ? "🔥 Rebelado" : (estado.penalidade_ativa ? "⚠️ Crise" : "✔️ Estável");
        const statusColor = estaEmRevolta ? "#f38ba8" : (estado.penalidade_ativa ? "#fab387" : "#a6e3a1");
        
        const nomeCurto = estado.nome.replace("Província do ", "").replace("Província de ", "").replace("Província da ", "").replace("Capitania do ", "").replace("Capitania de ", "").replace("Capitania da ", "");

        return `
            <tr>
                <td style="padding: 6px 4px; font-weight: bold;">${nomeCurto}</td>
                <td style="padding: 6px 4px; text-align: right;">$${estado.economia.pib_total.toFixed(1)}</td>
                <td style="padding: 6px 4px; text-align: right;">${(estado.pacto_federativo.aliquota_imposto * 100).toFixed(0)}%</td>
                <td style="padding: 6px 4px; text-align: right;">${estado.defesa.indice_revolta.toFixed(0)}%</td>
                <td style="padding: 6px 4px; text-align: right; color: ${statusColor}; font-weight: bold;">${statusText}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Atualiza todos os dados textuais da interface e o mapa visual.
 * @param {Object} state - Estado mais recente
 */
function updateInterface(state) {
    // Inicializa histórico de snapshots se estiver vazio (ex: novo jogo ou nova era canônica)
    if (!state.globais.historico_jogador || state.globais.historico_jogador.length === 0) {
        state.globais.historico_jogador = [];
        const snap = capturarSnapshot(state);
        
        const era = state.globais.era_atual;
        if (historiaCanonica && historiaCanonica[era] && historiaCanonica[era].snapshots && historiaCanonica[era].snapshots.length > 0) {
            state.globais.divergencia_atual = calcularDivergencia(
                state,
                historiaCanonica[era].snapshots,
                historiaCanonica[era].decisoes_canonicas
            );
        } else {
            state.globais.divergencia_atual = 0.0;
        }
        
        snap.divergencia = state.globais.divergencia_atual;
        state.globais.historico_jogador.push(snap);
    }

    // 1. Lógica de Eras e Rótulos Visuais
    const era = state.globais.era_atual;
    const eraLabel = document.getElementById('mapa-era-label');
    
    document.body.dataset.era = era;

    // Sincroniza som
    const btnToggleAudio = document.getElementById('btn-toggle-audio');
    if (btnToggleAudio) {
        const audioEnabled = state.globais.settings ? state.globais.settings.audioEnabled : true;
        btnToggleAudio.innerText = audioEnabled ? "🔊" : "🔇";
    }

    // Sincroniza Alíquota Fiscal Geral
    const sliderAliquotaGeral = document.getElementById('slider-aliquota-geral');
    const aliquotaGeralValor = document.getElementById('aliquota-geral-valor');
    if (sliderAliquotaGeral && state.estados.length > 0) {
        const avgTax = state.estados.reduce((acc, e) => acc + e.pacto_federativo.aliquota_imposto, 0) / state.estados.length;
        const taxPct = Math.round(avgTax * 100);
        sliderAliquotaGeral.value = taxPct;
        if (aliquotaGeralValor) aliquotaGeralValor.innerText = `${taxPct}%`;
    }

    // Sincroniza o tema visual selecionado
    const estilo = (state.globais.config_ui && state.globais.config_ui.estilo_layout) || 'historico';
    aplicarTemaVisual(estilo);
    
    if (era === "colonial") {
        if (eraLabel) eraLabel.textContent = `Capitanias Hereditárias · 1530-1822`;
    } else if (era === "imperio") {
        if (eraLabel) eraLabel.textContent = `Províncias do Império · 1822-1889`;
    } else if (era === "republica") {
        if (eraLabel) eraLabel.textContent = `Estados Republicanos · 1889-1988`;
    }

    // Atualiza a barra de progresso da era
    atualizarProgressoEra(state);

    // 2. Atualiza Dados Globais
    anoEl.innerText = state.globais.ano_atual;
    tesouroEl.innerText = state.globais.tesouro_nacional.toFixed(2);
    
    if (state.globais.tesouro_nacional < 0) {
        tesouroEl.style.color = "#f38ba8";
    } else {
        tesouroEl.style.color = "#a6e3a1";
    }

    const btnBailout = document.getElementById('btn-bailout');
    if (btnBailout) {
        const era = state.globais.era_atual;
        const tesouro = state.globais.tesouro_nacional;
        if (tesouro < 50 && (era === 'colonial' || era === 'imperio')) {
            btnBailout.style.display = 'block';
            if (era === 'colonial') {
                btnBailout.innerText = 'Solicitar Socorro Régio de Lisboa';
                btnBailout.style.backgroundColor = '#fab387';
                btnBailout.style.color = '#3b2f2f';
            } else {
                btnBailout.innerText = 'Solicitar Empréstimo de Londres';
                btnBailout.style.backgroundColor = '#f38ba8';
                btnBailout.style.color = '#11111b';
            }
        } else {
            btnBailout.style.display = 'none';
        }
    }

    // Controla o painel do Poder Moderador (apenas na Era Imperial)
    const painelPoderEl = document.getElementById('painel-poder-moderador');
    if (painelPoderEl) {
        if (state.globais.era_atual === 'imperio') {
            painelPoderEl.style.display = 'flex';
        } else {
            painelPoderEl.style.display = 'none';
        }
    }

    // Controla o botão de Financiar Bandeiras (evento único por era)
    const btnBandeiras = document.getElementById('btn-bandeiras');
    if (btnBandeiras) {
        const eraAtual = state.globais.era_atual;
        // Só exibe na era colonial (bandeiras são fenômeno colonial)
        if (eraAtual !== 'colonial') {
            btnBandeiras.style.display = 'none';
        } else {
            btnBandeiras.style.display = 'block';
            if (state.globais.bandeiras_financiadas) {
                btnBandeiras.disabled = true;
                btnBandeiras.innerText = '✅ Bandeiras Financiadas — Interior em Exploração!';
            } else if (state.globais.ano_atual >= 1690) {
                btnBandeiras.disabled = true;
                btnBandeiras.innerText = '❌ Oportunidade Encerrada (Limite 1690)';
            } else {
                btnBandeiras.disabled = false;
                btnBandeiras.innerText = 'Financiar Bandeiras (Custo: 50 Contos)';
            }
        }
    }

    
    const toastContainer = document.getElementById('toast-container');
    const toastMessage = document.getElementById('toast-message');
    const modalConselho = document.getElementById('modal-conselho');
    const modalContent = document.getElementById('modal-content');
    
    // Alertas do Conselho
    let exibiuModalConselho = false;
    if (state.globais.alertas_conselho && state.globais.alertas_conselho.length > 0) {
        const alertasHtml = state.globais.alertas_conselho.map(alerta => `<li>${alerta}</li>`).join('');
        const contemUrgente = state.globais.alertas_conselho.some(a => a.includes("URGENTE") || a.includes("terminou") || a.includes("concluído"));
        
        if (state.globais.config_ui.exibir_popup_conselho || contemUrgente) {
            modalContent.innerHTML = `<ul>${alertasHtml}</ul>`;
            modalConselho.style.display = 'flex';
            exibiuModalConselho = true;
        } else {
            modalConselho.style.display = 'none';
        }
    } else {
        modalConselho.style.display = 'none';
    }

    // 3. Verificação de Modal de Fim de Era
    const modalTransicao = document.getElementById('modal-transicao-era');
    if (state.globais.fim_da_era) {
        if (modalTransicao) {
            const pibTotal = state.estados.reduce((acc, e) => acc + e.economia.pib_total, 0);
            const tesouro = state.globais.tesouro_nacional;
            const mediaRevolta = state.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / state.estados.length;
            const pontos = Math.round(pibTotal * 1.0 + tesouro * 0.5 - mediaRevolta * 5);
            const anoAtual = state.globais.ano_atual;
            const tipoIndep = state.globais.tipo_independencia || "historica";
            const anoIndep = state.globais.ano_independencia || anoAtual;
            const divergencia = state.globais.divergencia_atual || 0;

            const tituloEl = document.getElementById('transicao-titulo');
            const badgeEl = document.getElementById('transicao-badge-tipo');
            const bannerImg = document.getElementById('transicao-banner-img');
            const narrativaEl = document.getElementById('transicao-narrativa');
            const divEl = document.getElementById('transicao-divergencia');
            const divLabelEl = document.getElementById('transicao-divergencia-label');

            const divNormal = document.getElementById('transicao-caminhos-botoes');
            const divGameOver = document.getElementById('transicao-gameover-botoes');
            const caminhosTitulo = document.getElementById('transicao-caminhos-titulo');

            if (state.globais.game_over) {
                if (tituloEl) tituloEl.innerText = "💥 Colapso Monárquico! (Game Over)";
                if (badgeEl) {
                    badgeEl.textContent = "❌ Fim de Jogo";
                    badgeEl.style.borderColor = "#f38ba8";
                    badgeEl.style.color = "#f38ba8";
                }
                if (bannerImg) bannerImg.src = "assets/img/eventos/ciclo_ouro_inconfidencia.png";
                if (narrativaEl) narrativaEl.innerHTML = `Sua recusa em assinar a abolição da escravidão em 1888 provocou revoltas populares generalizadas e rebeliões de escravizados por todo o país. O Império colapsou sob a fúria das províncias rebeladas em 1889. A monarquia caiu.<br><br><strong>A simulação foi encerrada devido à revolta popular incontrolável.</strong>`;
                
                if (divNormal) divNormal.style.display = 'none';
                if (divGameOver) divGameOver.style.display = 'flex';
                if (caminhosTitulo) caminhosTitulo.textContent = "A Simulação foi Encerrada";
            } else {
                if (divNormal) divNormal.style.display = 'flex';
                if (divGameOver) divGameOver.style.display = 'none';
                if (caminhosTitulo) caminhosTitulo.textContent = "Escolha o Caminho para a Próxima Era";

                if (era === "colonial") {
                    const isPrecoce = anoIndep < 1822;
                    const isUcronica = tipoIndep === "ucronica";

                    if (tituloEl) tituloEl.innerText = isPrecoce
                        ? `⚡ Independência Precoce! (${anoIndep})`
                        : "🇧🇷 Independência do Brasil — 1822";

                    if (bannerImg) {
                        bannerImg.src = isPrecoce
                            ? "assets/img/eventos/independencia_precoce.png"
                            : "assets/img/eventos/independencia.png";
                    }

                    if (badgeEl) {
                        if (isPrecoce && isUcronica) {
                            badgeEl.textContent = "⚡ Ucrônica — Precoce";
                            badgeEl.style.borderColor = "#cba6f7";
                            badgeEl.style.color = "#cba6f7";
                        } else if (isUcronica) {
                            badgeEl.textContent = "⚡ Ucrônica";
                            badgeEl.style.borderColor = "#cba6f7";
                            badgeEl.style.color = "#cba6f7";
                        } else {
                            badgeEl.textContent = "✅ Histórica";
                            badgeEl.style.borderColor = "#a6e3a1";
                            badgeEl.style.color = "#a6e3a1";
                        }
                    }

                    if (narrativaEl) {
                        if (isPrecoce) {
                            narrativaEl.innerHTML = `O Brasil proclamou sua independência em <strong>${anoIndep}</strong>, décadas antes do esperado pela história.
                                Sua hábil administração gerou uma colônia próspera e unida o suficiente para romper com Lisboa.
                                A linhagem de governadores e fazendeiros que você consolidou transformou o destino da nação.
                                <br><br>Agora, escolha como a <strong>Era Imperial</strong> começará: com a riqueza que você acumulou, ou recalibrando para os dados históricos reais.`;
                        } else if (isUcronica) {
                            narrativaEl.innerHTML = `O Brasil seguiu um caminho alternativo ao da história: em vez da proclamação clássica de Dom Pedro I,
                                optou por <strong>manter vínculos com Portugal</strong> em um acordo de autonomia.
                                O Período Colonial chegou ao fim e o Brasil emerge como nação em formação,
                                moldada pelas suas decisões únicas ao longo de ${anoIndep - 1530} anos de governo.`;
                        } else {
                            narrativaEl.innerHTML = `Em 7 de setembro de <strong>1822</strong>, às margens do Riacho do Ipiranga, Dom Pedro I proclamou:
                                <em>"Independência ou Morte!"</em>. Assim, o Brasil encerrou mais de três séculos de domínio colonial.
                                Sob sua liderança, a nação chegou a este momento histórico.
                                <br><br>Ao virar a página para a <strong>Era Imperial</strong>, seu legado será o ponto de partida da nova nação.`;
                        }
                    }
                } else {
                    if (tituloEl) tituloEl.innerText = "⚖️ Proclamação da República — 1889";
                    if (bannerImg) bannerImg.src = "assets/img/eventos/ciclo_ouro_inconfidencia.png";
                    if (badgeEl) badgeEl.textContent = "📜 Fim do Império";
                    if (narrativaEl) narrativaEl.innerHTML = `Em <strong>15 de novembro de 1889</strong>, o Marechal Deodoro da Fonseca liderou o golpe que pôs fim ao Segundo Reinado.
                        O Brasil Imperial, que você governou por ${anoAtual - 1822} anos, agora cede lugar à República.
                        O legado que você construiu determinará o ponto de partida da nova era.`;
                }
            }

            const anoMetricEl = document.getElementById('transicao-ano');
            if (anoMetricEl) anoMetricEl.innerText = anoAtual;
            const pibMetricEl = document.getElementById('transicao-pib');
            if (pibMetricEl) pibMetricEl.innerText = `${pibTotal.toFixed(0)} Contos`;
            const tesouMetricEl = document.getElementById('transicao-tesouro');
            if (tesouMetricEl) tesouMetricEl.innerText = `${tesouro.toFixed(0)} Contos`;
            const pontosMetricEl = document.getElementById('transicao-pontos');
            if (pontosMetricEl) pontosMetricEl.innerText = `${pontos} pts`;

            if (divEl) divEl.textContent = `${divergencia.toFixed(1)}%`;
            if (divLabelEl) {
                if (divergencia < 20) {
                    divLabelEl.textContent = "(Próximo da História Real)";
                    if (divEl) divEl.style.color = "#a6e3a1";
                } else if (divergencia < 50) {
                    divLabelEl.textContent = "(Linha Moderada — Divergência Notável)";
                    if (divEl) divEl.style.color = "#f9e2af";
                } else {
                    divLabelEl.textContent = "(Ucronia Profunda — História Alternativa Significativa)";
                    if (divEl) divEl.style.color = "#cba6f7";
                }
            }

            modalTransicao.style.display = 'flex';
        }
    } else {
        if (modalTransicao) modalTransicao.style.display = 'none';
    }

    // 3.5 Verificação de Bifurcações de Eventos
    verificarEventosBifurcacao(state);
    
    // Centraliza o controle de ativação do botão avançar
    const temBifurcacoes = state.globais.eventos_pendentes_bifurcacao && state.globais.eventos_pendentes_bifurcacao.length > 0;
    if (state.globais.fim_da_era || temBifurcacoes || exibiuModalConselho) {
        btnAvancar.disabled = true;
    } else {
        btnAvancar.disabled = false;
    }
    
    // 4. Atualiza Dados por Estado (Apenas Cartões)
    state.estados.forEach(estado => {
        // Atualiza textos do cartão se ele existir na tela
        const pibText = document.getElementById(`pib-${estado.id}`);
        const revoltaText = document.getElementById(`revolta-${estado.id}`);
        const statusText = document.getElementById(`status-${estado.id}`);
        
        if (pibText) pibText.innerText = `$${estado.economia.pib_total.toFixed(2)}`;
        if (revoltaText) revoltaText.innerText = `${estado.defesa.indice_revolta.toFixed(1)}%`;
        
        const portoEl = document.getElementById(`porto-${estado.id}`);
        const estradasEl = document.getElementById(`estradas-${estado.id}`);
        const defesaEl = document.getElementById(`defesa-${estado.id}`);
        if (portoEl && estradasEl && defesaEl) {
            portoEl.innerText = estado.infraestrutura.modal_portuario;
            estradasEl.innerText = estado.infraestrutura.modal_rodoviario;
            defesaEl.innerText = estado.defesa.milicia_local;
        }
        
        if (statusText) {
            const statusTerr = estado.status_territorio || "controlado";
            const estaEmRevolta = estado.defesa.indice_revolta >= 70;
            
            if (statusTerr === "invadido") {
                statusText.innerText = `🏴 INVADIDO (${estado.invadido_por || 'inimigo'})`;
                statusText.style.color = "#89b4fa";
            } else if (statusTerr === "rebelado" || estaEmRevolta) {
                statusText.innerText = "🔥 REBELADO";
                statusText.style.color = "#f38ba8";
            } else if (statusTerr === "independente") {
                statusText.innerText = "🟣 INDEPENDENTE";
                statusText.style.color = "#cba6f7";
            } else if (estado.penalidade_ativa) {
                // Tooltip dinâmico de crise (Fase 3.0)
                const causas = (estado.penalidades || [])
                    .filter(p => p.duracao_anos > 0)
                    .map(p => `• ${p.nome || p.tipo} (${p.duracao_anos} ano(s))`)
                    .join('&lt;br&gt;');
                const tooltipCrise = `⚠️ &lt;strong&gt;Causas da Crise:&lt;/strong&gt;&lt;br&gt;${causas || 'Penalidade ativa'}`;
                statusText.innerText = "⚠️ EM CRISE";
                statusText.style.color = "#fab387";
                statusText.setAttribute('data-tooltip-game', tooltipCrise);
            } else {
                statusText.innerText = "✔️ PACIFICADO";
                statusText.style.color = "#cdd6f4";
                statusText.removeAttribute('data-tooltip-game');
            }

            // Atualiza visibilidade dos controles do cartão (território inacessível)
            const cardEl = document.getElementById(`card-${estado.id}`);
            if (cardEl) {
                const inacessivelBlock = cardEl.querySelector('.territorio-inacessivel');
                const controlGroup = cardEl.querySelector('.control-group');
                const btnUpgrades = cardEl.querySelectorAll('.btn-upgrade');
                const isInacessivel = statusTerr !== "controlado";
                
                if (isInacessivel && !inacessivelBlock) {
                    // Needs re-render: recreate cards to show the correct block
                    // This is handled by createCards being called when status changes
                }
            }
        }
    });

    // 5. Renderiza e atualiza o mapa dinâmico D3
    renderMapD3(state);

    // Atualiza a legenda, a aba de economia e a aba de ucronia
    atualizarLegendaMapa(era);
    atualizarAbaEconomia(state);
    renderUchroniaPanel(state, historiaCanonica);
    renderBiblioteca(state);
}

/**
 * Puxa os dados dos Sliders do HTML e injeta no estado ANTES de avançar o ano.
 */
function applyPlayerDecisions() {
    document.querySelectorAll('.repasse-slider').forEach(slider => {
        const estadoId = slider.dataset.estado;
        const novoRepasse = parseFloat(slider.value) / 100;
        
        const estadoObj = currentState.estados.find(e => e.id === estadoId);
        if (estadoObj) {
            estadoObj.pacto_federativo.repasse_estado = novoRepasse;
            estadoObj.pacto_federativo.retencao_uniao = 1.0 - novoRepasse;
        }
    });
}

// --- CONTROLE DOS RANKINGS COM SUPORTE CLOUD/LOCAL ---
async function carregarRankings() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    try {
        const rankings = await getRankings();
        if (!rankings || rankings.length === 0) {
            list.innerHTML = `<li style="opacity: 0.6; text-align: center; padding: 5px 0;">Nenhum recorde registrado ainda</li>`;
            return;
        }

        list.innerHTML = rankings.map((r, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎖️';
            const displayEra = r.era === "colonial" ? "Colônia" : r.era === "imperio" ? "Império" : r.era;
            return `<li style="padding: 5px 10px; display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.05);">
                <span>${medal} ${displayEra} (${r.username || r.nomeEra || 'Jogador'})</span>
                <strong>${r.score || r.pontos} pts</strong>
            </li>`;
        }).join('');
    } catch (e) {
        console.error("Erro ao carregar rankings:", e);
    }
}

async function registrarPontuacaoEra(era, tipo, pontos) {
    try {
        const timelineName = tipo === "ucronica" ? "Ucrônica" : "Histórica";
        await saveScoreToRanking(pontos, era, timelineName);
        await carregarRankings();
    } catch (e) {
        console.error("Erro ao registrar recorde:", e);
    }
}


function limparRankings(bypassConfirm = false) {
    if (bypassConfirm) {
        realizarLimpar();
    } else {
        const modal = document.getElementById('modal-confirmar-limpar');
        if (modal) modal.style.display = 'flex';
    }
}

function realizarLimpar() {
    clearLocalRankings();
    carregarRankings();
    
    // Reinicia o estado do jogo para o início
    currentState = getInitialGameState();
    createCards(currentState);
    updateInterface(currentState);
    
    // Salva o novo estado limpo
    saveGameState(currentState).catch(e => console.error(e));
    
    mostrarToast(`<strong style="color: #a6e3a1;">Sucesso:</strong> Histórico e recordes limpos.`);
}


// Event Listeners Gerais
const btnFecharModal = document.getElementById('btn-fechar-modal');
if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
        const chkSilenciar = document.getElementById('chk-silenciar-conselho');
        if (chkSilenciar && chkSilenciar.checked) {
            currentState.globais.config_ui.exibir_popup_conselho = false;
        }
        currentState.globais.alertas_conselho = [];
        updateInterface(currentState);
    });
}

const btnBandeiras = document.getElementById('btn-bandeiras');
if (btnBandeiras) {
    btnBandeiras.addEventListener('click', () => {
        if (currentState.globais.bandeiras_financiadas || currentState.globais.ano_atual >= 1690) {
            return;
        }
        
        const modalBandeiras = document.getElementById('modal-bandeiras');
        const badgeAno = document.getElementById('bandeiras-modal-ano');
        if (badgeAno) {
            badgeAno.textContent = currentState.globais.ano_atual;
        }
        if (modalBandeiras) {
            modalBandeiras.style.display = 'flex';
        }
    });
}

// Configura os botões do modal de confirmação das Bandeiras
const btnBandeirasFinanciar = document.getElementById('btn-bandeiras-financiar');
if (btnBandeirasFinanciar) {
    btnBandeirasFinanciar.addEventListener('click', () => {
        const custo = 50;
        if (currentState.globais.tesouro_nacional < custo) {
            mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> Tesouro insuficiente! Necessário $${custo} Contos de Réis para financiar Bandeiras.`);
            return;
        }
        
        currentState = financiarBandeiras(currentState);
        
        // Auto-save silencioso
        try {
            localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState));
        } catch (err) {
            console.error("Erro ao salvar após financiar bandeiras:", err);
        }
        
        const modalBandeiras = document.getElementById('modal-bandeiras');
        if (modalBandeiras) {
            modalBandeiras.style.display = 'none';
        }
        
        updateInterface(currentState);
        mostrarToast(`<strong style="color: #a6e3a1;">Sucesso:</strong> Bandeiras financiadas! (+100 Exploração)`);
    });
}

const btnBandeirasAdiar = document.getElementById('btn-bandeiras-adiar');
if (btnBandeirasAdiar) {
    btnBandeirasAdiar.addEventListener('click', () => {
        const modalBandeiras = document.getElementById('modal-bandeiras');
        if (modalBandeiras) {
            modalBandeiras.style.display = 'none';
        }
    });
}

const btnBailout = document.getElementById('btn-bailout');
if (btnBailout) {
    btnBailout.addEventListener('click', () => {
        const era = currentState.globais.era_atual;
        if (era === 'colonial') {
            if (confirm("Deseja realmente solicitar socorro financeiro a Lisboa?\n\nIsso trará +400 Contos imediatos, mas aumentará a retenção fiscal de Portugal (+5% de retenção), aumentará a revolta em todas as capitanias (+15%) e gerará uma dívida anual (-15 contos por 25 anos) com a Metrópole.")) {
                currentState = solicitarSocorroRegio(currentState);
                salvarJogo();
                updateInterface(currentState);
                mostrarToast(`<strong style="color: #fab387;">Socorro Régio!</strong> Oficiais de Lisboa chegam com arrocho fiscal.`);
            }
        } else if (era === 'imperio') {
            if (confirm("Deseja realmente contratar um empréstimo em Londres?\n\nIsso trará +600 Contos imediatos, mas cobrará juros anuais (-35 contos por 20 anos) e reduzirá a taxa de crescimento do PIB nacional (-0.5% ao ano por 20 anos) devido à fuga de capital.")) {
                currentState = solicitarEmprestimoLondres(currentState);
                salvarJogo();
                updateInterface(currentState);
                mostrarToast(`<strong style="color: #f38ba8;">Dívida Externa!</strong> Empréstimo assinado com banqueiros de Londres.`);
            }
        }
    });
}

// Save / Load / Reset
async function salvarJogo() {
    try {
        const success = await saveGameState(currentState);
        if (success) {
            mostrarToast(`<strong style="color: #a6e3a1;">Sucesso:</strong> Progresso salvo.`);
        }
    } catch (e) {
        console.error("Erro ao salvar:", e);
        mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> Falha ao salvar jogo.`);
    }
}

async function carregarJogo(silencioso = false) {
    try {
        const state = await loadGameState();
        if (!state) {
            if (!silencioso) {
                mostrarToast(`<strong style="color: #f9e2af;">Aviso:</strong> Nenhum progresso salvo encontrado.`);
            }
            return false;
        }
        
        currentState = state;
        createCards(currentState);
        updateInterface(currentState);
        
        // Sincroniza sliders
        currentState.estados.forEach(estado => {
            const slider = document.querySelector(`.repasse-slider[data-estado="${estado.id}"]`);
            if (slider) {
                slider.value = estado.pacto_federativo.repasse_estado * 100;
                const label = document.getElementById(`label-repasse-${estado.id}`);
                if (label) {
                    label.innerText = (estado.pacto_federativo.repasse_estado * 100).toFixed(0);
                }
            }
        });

        if (!silencioso) {
            mostrarToast(`<strong style="color: #a6e3a1;">Sucesso:</strong> Carregado save com sucesso no Ano ${currentState.globais.ano_atual}.`);
        }
        return true;
    } catch (e) {
        console.error("Erro ao carregar:", e);
        mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> Falha ao carregar progresso.`);
        return false;
    }
}

function reiniciarJogo(bypassConfirm = false) {
    if (bypassConfirm) {
        realizarReiniciar();
    } else {
        const modal = document.getElementById('modal-confirmar-reiniciar');
        if (modal) modal.style.display = 'flex';
    }
}

async function realizarReiniciar() {
    currentState = getInitialGameState();
    createCards(currentState);
    updateInterface(currentState);
    
    await saveGameState(currentState);
    carregarRankings();
    
    const modalConfirmarReiniciar = document.getElementById('modal-confirmar-reiniciar');
    if (modalConfirmarReiniciar) modalConfirmarReiniciar.style.display = 'none';

    const modalTransicao = document.getElementById('modal-transicao-era');
    if (modalTransicao) modalTransicao.style.display = 'none';
    
    mostrarToast(`Simulador reiniciado. Bem-vindo de volta a 1530!`);
}


// Configuração dos Event Listeners de Progresso
const btnSalvar = document.getElementById('btn-salvar');
if (btnSalvar) btnSalvar.addEventListener('click', salvarJogo);

const btnCarregar = document.getElementById('btn-carregar');
if (btnCarregar) btnCarregar.addEventListener('click', () => carregarJogo(false));

const btnReiniciar = document.getElementById('btn-reiniciar');
if (btnReiniciar) btnReiniciar.addEventListener('click', () => reiniciarJogo(false));

const btnLimparRankings = document.getElementById('btn-limpar-rankings');
if (btnLimparRankings) btnLimparRankings.addEventListener('click', () => limparRankings(false));

// Listeners do Modal de Confirmar Reinício
const btnReiniciarConfirmar = document.getElementById('btn-reiniciar-confirmar');
const btnReiniciarCancelar = document.getElementById('btn-reiniciar-cancelar');
const modalConfirmarReiniciar = document.getElementById('modal-confirmar-reiniciar');

if (btnReiniciarConfirmar) {
    btnReiniciarConfirmar.addEventListener('click', () => {
        if (modalConfirmarReiniciar) modalConfirmarReiniciar.style.display = 'none';
        realizarReiniciar();
    });
}
if (btnReiniciarCancelar) {
    btnReiniciarCancelar.addEventListener('click', () => {
        if (modalConfirmarReiniciar) modalConfirmarReiniciar.style.display = 'none';
    });
}

// Listeners do Modal de Confirmar Limpeza
const btnLimparConfirmar = document.getElementById('btn-limpar-confirmar');
const btnLimparCancelar = document.getElementById('btn-limpar-cancelar');
const modalConfirmarLimpar = document.getElementById('modal-confirmar-limpar');

if (btnLimparConfirmar) {
    btnLimparConfirmar.addEventListener('click', () => {
        if (modalConfirmarLimpar) modalConfirmarLimpar.style.display = 'none';
        realizarLimpar();
    });
}
if (btnLimparCancelar) {
    btnLimparCancelar.addEventListener('click', () => {
        if (modalConfirmarLimpar) modalConfirmarLimpar.style.display = 'none';
    });
}

// Listeners do Modal de Transição de Era
const btnTransicaoUcronica = document.getElementById('btn-transicao-ucronica');
const btnTransicaoCanonica = document.getElementById('btn-transicao-canonica');
const modalTransicao = document.getElementById('modal-transicao-era');

if (btnTransicaoUcronica) {
    btnTransicaoUcronica.addEventListener('click', () => {
        const pibTotal = currentState.estados.reduce((acc, e) => acc + e.economia.pib_total, 0);
        const tesouro = currentState.globais.tesouro_nacional;
        const mediaRevolta = currentState.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / currentState.estados.length;
        const pontos = Math.round(pibTotal * 1.0 + tesouro * 0.5 - mediaRevolta * 5);

        const eraAnterior = currentState.globais.era_atual;
        
        // Salva pontos
        registrarPontuacaoEra(eraAnterior, "ucronica", pontos);

        // Transiciona
        currentState = transitionToEra(currentState, "imperio", "ucronica");
        
        if (modalTransicao) modalTransicao.style.display = 'none';
        
        // Recria cards para as 19 províncias
        createCards(currentState);
        updateInterface(currentState);

        localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState));
        mostrarToast(`<strong style="color: #a6e3a1;">Ucronia ativada!</strong> Bem-vindo ao Brasil Império (Caminho Ucrônico). Seus PIBs e infraestruturas foram herdados!`);
    });
}

if (btnTransicaoCanonica) {
    btnTransicaoCanonica.addEventListener('click', () => {
        const pibTotal = currentState.estados.reduce((acc, e) => acc + e.economia.pib_total, 0);
        const tesouro = currentState.globais.tesouro_nacional;
        const mediaRevolta = currentState.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / currentState.estados.length;
        const pontos = Math.round(pibTotal * 1.0 + tesouro * 0.5 - mediaRevolta * 5);

        const eraAnterior = currentState.globais.era_atual;
        
        // Salva pontos
        registrarPontuacaoEra(eraAnterior, "canonica", pontos);

        // Transiciona
        currentState = transitionToEra(currentState, "imperio", "canonica");
    });
}

// Listeners do Poder Moderador
const btnDecretarImpostos = document.getElementById('btn-decretar-impostos');
if (btnDecretarImpostos) {
    btnDecretarImpostos.addEventListener('click', () => {
        if (confirm("Deseja realmente Decretar Impostos Extraordinários?\n\nIsso trará +150 Contos imediatos ao Tesouro, mas aumentará o índice de revolta em todas as províncias em +10%.")) {
            currentState = decretarImpostosExtraordinarios(currentState);
            salvarJogo();
            updateInterface(currentState);
            mostrarToast(`<strong style="color: #fab387;">Poder Moderador:</strong> Impostos extraordinários cobrados.`);
        }
    });
}

const btnDissolverAssembleia = document.getElementById('btn-dissolver-assembleia');
if (btnDissolverAssembleia) {
    btnDissolverAssembleia.addEventListener('click', () => {
        if (currentState.globais.tesouro_nacional < 80) {
            mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> Tesouro insuficiente! Necessário $80 Contos para dissolver a assembleia.`);
            return;
        }
        if (confirm("Deseja realmente Dissolver a Assembleia Geral?\n\nIsso custará -80 Contos de Réis em custos políticos/campanha, mas reduzirá a revolta em todas as províncias em -15%.")) {
            currentState = dissolverAssembleiaGeral(currentState);
            salvarJogo();
            updateInterface(currentState);
            mostrarToast(`<strong style="color: #f38ba8;">Poder Moderador:</strong> Parlamento dissolvido pelo Imperador.`);
        }
    });
}

// Listener do botão de reiniciar em caso de GameOver no modal de transição
const btnGameoverReiniciar = document.getElementById('btn-transicao-gameover-reiniciar');
if (btnGameoverReiniciar) {
    btnGameoverReiniciar.addEventListener('click', () => {
        reiniciarJogo(true); // Reinicia sem confirmação extra
    });
}
 
btnAvancar.addEventListener('click', () => {
    applyPlayerDecisions();
    AudioController.playTurn();
    currentState = advanceYear(currentState);
    currentState = checkEvents(currentState);
    updateInterface(currentState);
    
    // Auto-save silencioso na nuvem ou local
    saveGameState(currentState).catch(e => console.error("Auto-save falhou:", e));
});


// Listener do Botão de Som (Mudo / Ativo)
const btnToggleAudio = document.getElementById('btn-toggle-audio');
if (btnToggleAudio) {
    btnToggleAudio.addEventListener('click', () => {
        currentState.globais.settings = currentState.globais.settings || { audioEnabled: true };
        currentState.globais.settings.audioEnabled = !currentState.globais.settings.audioEnabled;
        
        btnToggleAudio.innerText = currentState.globais.settings.audioEnabled ? "🔊" : "🔇";
        if (currentState.globais.settings.audioEnabled) {
            AudioController.playClick();
        }
        
        try {
            localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState));
        } catch (err) {}
    });
}

// Listener do Slider de Alíquota Fiscal Geral
const sliderAliquotaGeral = document.getElementById('slider-aliquota-geral');
const aliquotaGeralValor = document.getElementById('aliquota-geral-valor');
if (sliderAliquotaGeral) {
    sliderAliquotaGeral.addEventListener('input', (e) => {
        const valPct = parseInt(e.target.value);
        if (aliquotaGeralValor) aliquotaGeralValor.innerText = `${valPct}%`;
        
        // Atualiza a alíquota de impostos de todas as capitanias no estado
        currentState.estados.forEach(est => {
            const statusTerr = est.status_territorio || "controlado";
            if (statusTerr === "controlado") {
                est.pacto_federativo.aliquota_imposto = valPct / 100;
            }
        });
        
        // Recalcula visualmente a previsão econômica na tabela e resumo
        atualizarAbaEconomia(currentState);
    });
    
    // Quando soltar o slider, salva o jogo
    sliderAliquotaGeral.addEventListener('change', () => {
        try {
            localStorage.setItem('ucronia_brasilis_save', JSON.stringify(currentState));
        } catch (err) {}
    });
}

// Listeners do Diário de Bordo
const btnOpenDiario = document.getElementById('btn-open-diario');
const modalDiario = document.getElementById('modal-diario-bordo');
const btnFecharDiario = document.getElementById('btn-fechar-diario');
const btnDiarioEntendido = document.getElementById('btn-diario-entendido');

if (btnOpenDiario && modalDiario) {
    btnOpenDiario.addEventListener('click', () => {
        renderEventLog();
        modalDiario.style.display = 'flex';
    });
}

const fecharDiarioBordo = () => {
    if (modalDiario) modalDiario.style.display = 'none';
};

if (btnFecharDiario) btnFecharDiario.addEventListener('click', fecharDiarioBordo);
if (btnDiarioEntendido) btnDiarioEntendido.addEventListener('click', fecharDiarioBordo);

function renderEventLog() {
    const conteudoEl = document.getElementById('diario-bordo-conteudo');
    if (!conteudoEl) return;
    
    const logs = currentState.globais.eventLog || [];
    if (logs.length === 0) {
        conteudoEl.innerHTML = `<p style="opacity: 0.6; text-align: center; font-style: italic; padding: 20px 0; color: var(--text-color);">O Diário de Bordo está vazio. Avance alguns anos e tome decisões para gerar registros.</p>`;
        return;
    }
    
    conteudoEl.innerHTML = logs.map(item => {
        let tipoClass = "diario-item-tipo-info";
        if (item.tipo === "decisao") tipoClass = "diario-item-tipo-decisao";
        else if (item.tipo === "evento") tipoClass = "diario-item-tipo-evento";
        
        return `
            <div class="diario-item ${tipoClass}">
                <span class="diario-item-ano">Ano ${item.ano}</span>
                <span style="color: var(--text-color);">${item.texto}</span>
            </div>
        `;
    }).join('');
}

// Start da Aplicação:
setupTabs();
setupBibliotecaListeners();
setupZoom();
setupThemeSelector();
setupGameTooltips();
setupFilterListeners();

// Inicia Fluxo de Autenticação e Menu
initAuthFlow();

// Listener do Botão Voltar ao Topo
const btnScrollTop = document.getElementById('btn-scroll-top');
const tabContentWrapper = document.querySelector('.tab-content-wrapper');

if (tabContentWrapper && btnScrollTop) {
    tabContentWrapper.addEventListener('scroll', () => {
        if (tabContentWrapper.scrollTop > 300) {
            btnScrollTop.style.display = 'flex';
        } else {
            btnScrollTop.style.display = 'none';
        }
    });

    btnScrollTop.addEventListener('click', () => {
        tabContentWrapper.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Controla os painéis de Login, Menu Principal e Jogo
 */
function initAuthFlow() {
    const authScreen = document.getElementById('auth-screen');
    const menuScreen = document.getElementById('menu-screen');
    const gameContainer = document.getElementById('app-game-container');
    const menuUserName = document.getElementById('menu-user-name');

    // Transição entre Login e Registro
    const linkGoToRegister = document.getElementById('link-go-to-register');
    const linkGoToLogin = document.getElementById('link-go-to-login');
    const panelLogin = document.getElementById('panel-login');
    const panelRegister = document.getElementById('panel-register');

    if (linkGoToRegister && linkGoToLogin) {
        linkGoToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            panelLogin.style.display = 'none';
            panelRegister.style.display = 'block';
        });
        linkGoToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            panelRegister.style.display = 'none';
            panelLogin.style.display = 'block';
        });
    }

    // Formulário de Login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                mostrarToast('Verificando credenciais...');
                await loginUser(email, password);
                mostrarToast('<strong style="color: #a6e3a1;">Sucesso:</strong> Login efetuado com sucesso.');
            } catch (err) {
                mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> ${err.message}`);
            }
        });
    }

    // Formulário de Registro
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            try {
                mostrarToast('Registrando nova conta...');
                await registerUser(username, email, password);
                mostrarToast('<strong style="color: #a6e3a1;">Sucesso:</strong> Conta criada! Bem-vindo.');
            } catch (err) {
                mostrarToast(`<strong style="color: #f38ba8;">Erro:</strong> ${err.message}`);
            }
        });
    }

    // Login Convidado (Modo Offline)
    const btnLoginGuest = document.getElementById('btn-login-guest');
    if (btnLoginGuest) {
        btnLoginGuest.addEventListener('click', () => {
            loginAsGuest();
            mostrarToast('Entrando em Modo Convidado (Offline)...');
        });
    }

    // Logout
    const btnMenuLogout = document.getElementById('btn-menu-logout');
    if (btnMenuLogout) {
        btnMenuLogout.addEventListener('click', async () => {
            await logoutUser();
            mostrarToast('Sessão encerrada.');
        });
    }

    // Callback de Mudança de Estado de Autenticação
    initAuth((user) => {
        if (user) {
            authScreen.style.display = 'none';
            menuScreen.style.display = 'flex';
            gameContainer.style.display = 'none';
            if (menuUserName) {
                menuUserName.innerText = user.displayName || user.email.split('@')[0];
            }
            carregarRankings();
        } else {
            authScreen.style.display = 'flex';
            menuScreen.style.display = 'none';
            gameContainer.style.display = 'none';
        }
    });

    // Ações do Menu Principal
    const btnMenuNovoJogo = document.getElementById('btn-menu-novo-jogo');
    const modalSelecaoEra = document.getElementById('modal-selecao-era');
    const btnCancelarSelecaoEra = document.getElementById('btn-cancelar-selecao-era');

    if (btnMenuNovoJogo && modalSelecaoEra) {
        btnMenuNovoJogo.addEventListener('click', () => {
            modalSelecaoEra.style.display = 'flex';
        });
    }

    if (btnCancelarSelecaoEra && modalSelecaoEra) {
        btnCancelarSelecaoEra.addEventListener('click', () => {
            modalSelecaoEra.style.display = 'none';
        });
    }

    // Selecionar Era para Novo Jogo
    const btnEraChoices = document.querySelectorAll('.btn-era-select-choice');
    btnEraChoices.forEach(btn => {
        btn.addEventListener('click', async () => {
            const era = btn.getAttribute('data-era');
            modalSelecaoEra.style.display = 'none';
            menuScreen.style.display = 'none';
            gameContainer.style.display = 'flex';

            if (era === 'colonial') {
                currentState = getInitialGameState();
            } else if (era === 'imperio') {
                // Pula diretamente para a transição do Império
                currentState = getInitialGameState();
                currentState = transitionToEra(currentState, 'imperio');
            }

            createCards(currentState);
            updateInterface(currentState);
            await saveGameState(currentState);
            mostrarToast(`<strong style="color: #a6e3a1;">Jogo Iniciado:</strong> Simulação carregada em ${currentState.globais.ano_atual}.`);
        });
    });

    // Carregar Jogo do Menu
    const btnMenuCarregarJogo = document.getElementById('btn-menu-carregar-jogo');
    if (btnMenuCarregarJogo) {
        btnMenuCarregarJogo.addEventListener('click', async () => {
            const success = await carregarJogo(true);
            if (success) {
                menuScreen.style.display = 'none';
                gameContainer.style.display = 'flex';
                mostrarToast(`<strong style="color: #a6e3a1;">Sucesso:</strong> Progresso carregado no Ano ${currentState.globais.ano_atual}.`);
            } else {
                mostrarToast(`<strong style="color: #f9e2af;">Aviso:</strong> Nenhum progresso salvo encontrado.`);
            }
        });
    }

    // Modal de Manual / Tutorial
    const btnMenuManual = document.getElementById('btn-menu-manual');
    const modalManual = document.getElementById('modal-manual-tutorial');
    const btnFecharManual = document.getElementById('btn-fechar-manual');

    if (btnMenuManual && modalManual) {
        btnMenuManual.addEventListener('click', () => {
            modalManual.style.display = 'flex';
        });
    }

    if (btnFecharManual && modalManual) {
        btnFecharManual.addEventListener('click', () => {
            modalManual.style.display = 'none';
        });
    }

    // Botão de Retornar ao Menu de dentro do Jogo (salva antes de voltar)
    const progControls = document.querySelector('.progresso-controles');
    if (progControls) {
        if (!document.getElementById('btn-voltar-menu')) {
            const btnVoltar = document.createElement('button');
            btnVoltar.id = 'btn-voltar-menu';
            btnVoltar.innerText = 'Voltar ao Menu';
            btnVoltar.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            btnVoltar.style.border = '1px solid var(--panel-border)';
            btnVoltar.style.color = 'var(--text-color)';
            btnVoltar.addEventListener('click', async () => {
                mostrarToast('Salvando progresso...');
                await salvarJogo();
                gameContainer.style.display = 'none';
                menuScreen.style.display = 'flex';
            });
            // Insere o botão de voltar antes do botão de reiniciar para segurança
            progControls.insertBefore(btnVoltar, document.getElementById('btn-reiniciar'));
        }
    }
}


/**
 * Renderiza o mapa dinâmico de regiões, portos e caminhos de estradas usando D3.js.
 * @param {Object} state - O estado do jogo atualizado.
 */
function renderMapD3(state) {
    const era = state.globais.era_atual;
    const geojson = era === "colonial" ? capitaniasGeoJSON : estados1822GeoJSON;
    const svg = d3.select("#mapa-d3");
    const width = 500;
    const height = 720;

    // Se mudou a era, limpa todo o mapa anterior para redesenhar
    if (svg.attr("data-rendered-era") !== era) {
        svg.attr("data-rendered-era", era);
        svg.select("#mapa-regioes").selectAll("*").remove();
        svg.select("#mapa-infraestrutura").selectAll("*").remove();
        svg.select("#mapa-portos").selectAll("*").remove();
        svg.select("#mapa-rotulos").selectAll("*").remove();
    }

    // Projeção planar 2D (geoIdentity) para evitar problemas com winding order das coordenadas
    const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width - 20, height - 60], geojson);
    const pathGenerator = d3.geoPath().projection(projection);

    // 1. Polígonos de Regiões
    const paths = svg.select("#mapa-regioes")
        .selectAll(".state-path")
        .data(geojson.features, d => d.id);

    const pathsEnter = paths.enter()
        .append("path")
        .attr("class", "state-path")
        .attr("id", d => d.id)
        .attr("filter", "url(#sombra-estado)")
        .attr("d", pathGenerator);

    const allPaths = pathsEnter.merge(paths);

    allPaths
        .attr("d", pathGenerator)
        .style("fill", d => {
            const estado = state.estados.find(e => e.id === d.id);
            if (!estado) return "#a6e3a1";
            // Fase 3.0: Cores de inacessibilidade territorial
            const statusTerr = estado.status_territorio || "controlado";
            if (statusTerr === "invadido") return "#1a3a6b"; // azul-escuro holandês
            if (statusTerr === "independente") return "#6b3d8c"; // roxo
            if (estado.defesa.indice_revolta >= 100) return "#7b0000"; // vermelho intenso (rebelado total)
            if (estado.defesa.indice_revolta >= 70) {
                return "#f38ba8"; // Rebelado
            } else if (estado.penalidade_ativa) {
                return "#fab387"; // Crise
            } else if (estado.defesa.indice_revolta < 30) {
                return "#a6e3a1"; // Pacificado
            } else {
                return "#f9e2af"; // Tensão
            }
        })
        .style("opacity", d => {
            const estado = state.estados.find(e => e.id === d.id);
            if (filtroRegiaoAtual === 'todos' || (estado && estado.regiao === filtroRegiaoAtual)) {
                return 1.0;
            }
            return 0.25;
        });

    // Eventos de mouse
    allPaths
        .on("mouseenter", (event, d) => {
            const estado = state.estados.find(e => e.id === d.id);
            const tooltip = document.getElementById('mapa-tooltip');
            const tooltipText = document.getElementById('mapa-tooltip-text');
            if (estado && tooltip && tooltipText) {
                const statusTerr = estado.status_territorio || "controlado";
                let status = '✔️ PACIFICADO';
                if (statusTerr === 'invadido') status = `🏴 INVADIDO (${estado.invadido_por})`;
                else if (statusTerr === 'independente') status = '🟣 INDEPENDENTE';
                else if (statusTerr === 'rebelado' || estado.defesa.indice_revolta >= 70) status = '🔥 REBELADO';
                else if (estado.penalidade_ativa) status = '⚠️ EM CRISE';
                tooltipText.textContent = `${estado.nome} — PIB: $${estado.economia.pib_total.toFixed(1)} | Revolta: ${estado.defesa.indice_revolta.toFixed(0)}% | ${status}`;
                tooltip.classList.add('visivel');
            }
        })
        .on("mousemove", (event) => {
            const tooltip = document.getElementById('mapa-tooltip');
            if (tooltip) {
                const containerRect = document.querySelector('.col-right').getBoundingClientRect();
                const x = event.clientX - containerRect.left - (tooltip.offsetWidth / 2);
                const y = event.clientY - containerRect.top - 40;
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
                tooltip.style.bottom = 'auto';
                tooltip.style.transform = 'none';
            }
        })
        .on("mouseleave", () => {
            const tooltip = document.getElementById('mapa-tooltip');
            if (tooltip) {
                tooltip.classList.remove('visivel');
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.bottom = '16px';
                tooltip.style.top = 'auto';
            }
        })
        .on("click", (event, d) => {
            // 1. Ativa a aba Territórios
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const tabBtn = document.querySelector('.tab-btn[data-tab="tab-territorios"]');
            const tabContent = document.getElementById('tab-territorios');
            if (tabBtn) tabBtn.classList.add('active');
            if (tabContent) tabContent.classList.add('active');

            // 2. Encontra e destaca o card correspondente
            const card = document.getElementById(`card-${d.id}`);
            if (card) {
                // Remove highlight anterior se existir
                document.querySelectorAll('.card-highlight').forEach(c => c.classList.remove('card-highlight'));
                // Scroll suave até o card
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Aplica o highlight animado
                card.classList.add('card-highlight');
                setTimeout(() => card.classList.remove('card-highlight'), 2000);
            }
        });

    paths.exit().remove();

    // 2. Infraestrutura (Estradas / Rodovias)
    const conexoes = era === "colonial" ? [
        ["maranhao", "ceara"],
        ["ceara", "rio_grande"],
        ["rio_grande", "itamaraca"],
        ["itamaraca", "pernambuco"],
        ["pernambuco", "bahia"],
        ["bahia", "ilheos"],
        ["ilheos", "porto_seguro"],
        ["porto_seguro", "espirito_santo"],
        ["espirito_santo", "sao_tome"],
        ["sao_tome", "sao_vicente"],
        ["sao_vicente", "santo_amaro"]
    ] : [
        ["grao_para", "maranhao"],
        ["maranhao", "piaui"],
        ["piaui", "ceara"],
        ["ceara", "rio_grande_do_norte"],
        ["rio_grande_do_norte", "paraiba"],
        ["paraiba", "pernambuco"],
        ["pernambuco", "alagoas"],
        ["alagoas", "sergipe"],
        ["sergipe", "bahia"],
        ["bahia", "espirito_santo"],
        ["espirito_santo", "rio_de_janeiro"],
        ["rio_de_janeiro", "sao_paulo"],
        ["sao_paulo", "santa_catarina"],
        ["santa_catarina", "rio_grande_do_sul"],
        ["rio_grande_do_sul", "cisplatina"],
        ["minas_gerais", "rio_de_janeiro"],
        ["minas_gerais", "sao_paulo"],
        ["minas_gerais", "bahia"],
        ["goias", "minas_gerais"],
        ["goias", "bahia"],
        ["mato_grosso", "goias"],
        ["mato_grosso", "sao_paulo"]
    ];

    const estradasValidas = conexoes.map(conn => {
        const est1 = state.estados.find(e => e.id === conn[0]);
        const est2 = state.estados.find(e => e.id === conn[1]);
        const feat1 = geojson.features.find(f => f.id === conn[0]);
        const feat2 = geojson.features.find(f => f.id === conn[1]);
        if (est1 && est2 && feat1 && feat2) {
            const coords1 = feat1.properties.capital_coords || feat1.properties.port_coords;
            const coords2 = feat2.properties.capital_coords || feat2.properties.port_coords;
            if (coords1 && coords2) {
                return {
                    id: `${conn[0]}-${conn[1]}`,
                    coords: [coords1, coords2],
                    level: Math.min(est1.infraestrutura.modal_rodoviario, est2.infraestrutura.modal_rodoviario)
                };
            }
        }
        return null;
    }).filter(x => x !== null);

    // 2. Infraestrutura (Estradas / Rodovias e Ferrovias)
    const links = svg.select("#mapa-infraestrutura")
        .selectAll(".road-group")
        .data(estradasValidas, d => d.id);

    const linksEnter = links.enter()
        .append("g")
        .attr("class", "road-group");

    linksEnter.append("line").attr("class", "road-line-bg");
    linksEnter.append("line").attr("class", "road-line-fg");

    const allLinks = linksEnter.merge(links);

    allLinks.select(".road-line-bg")
        .attr("x1", d => projection(d.coords[0])[0])
        .attr("y1", d => projection(d.coords[0])[1])
        .attr("x2", d => projection(d.coords[1])[0])
        .attr("y2", d => projection(d.coords[1])[1])
        .style("stroke-width", d => {
            if (d.level <= 1) return 1.5;
            if (d.level === 2) return 3;
            return 5;
        })
        .style("stroke", d => {
            if (era === "colonial") return "#8b5a2b";
            if (era === "imperio") return d.level >= 2 ? "#333333" : "#c5a059";
            return "#7f8c8d";
        })
        .style("stroke-dasharray", d => {
            if (era === "colonial") return "4 3";
            if (era === "imperio" && d.level < 2) return "5 4";
            return "none";
        })
        .style("opacity", d => {
            if (d.level <= 1) return 0.25;
            if (d.level === 2) return 0.7;
            return 0.95;
        });

    allLinks.select(".road-line-fg")
        .attr("x1", d => projection(d.coords[0])[0])
        .attr("y1", d => projection(d.coords[0])[1])
        .attr("x2", d => projection(d.coords[1])[0])
        .attr("y2", d => projection(d.coords[1])[1])
        .style("stroke-width", d => {
            if (era === "imperio" && d.level >= 2) return 1.5;
            if (era !== "colonial" && era !== "imperio" && d.level >= 2) return 1.5; // Ferrovia em eras futuras
            return 0;
        })
        .style("stroke", d => {
            if ((era === "imperio" || era === "republica" || era === "contemporanea" || era === "futura") && d.level >= 2) return "#ffffff";
            return "none";
        })
        .style("stroke-dasharray", d => {
            if (d.level >= 2) return "2 3";
            return "none";
        })
        .style("opacity", 0.95);

    links.exit().remove();

    // 3. Portos, Capitais e Defesa (Nós)
    const nosMapa = geojson.features.map(f => {
        const estado = state.estados.find(e => e.id === f.id);
        const hasPort = f.properties.port_coords !== null;
        const hasCapital = f.properties.capital_coords !== undefined && f.properties.capital_coords !== null;
        
        const capCoords = hasCapital ? f.properties.capital_coords : (hasPort ? f.properties.port_coords : null);
        const portCoords = hasPort ? f.properties.port_coords : null;
        
        let capX = capCoords ? projection(capCoords)[0] : null;
        let capY = capCoords ? projection(capCoords)[1] : null;
        let portX = portCoords ? projection(portCoords)[0] : null;
        let portY = portCoords ? projection(portCoords)[1] : null;

        // Se as coordenadas da capital e do porto coincidem, aplica um offset horizontal
        if (capX !== null && portX !== null && Math.abs(capX - portX) < 1 && Math.abs(capY - portY) < 1) {
            capX -= 6;
            portX += 6;
        }

        return {
            id: f.id,
            name: f.properties.name,
            capX,
            capY,
            portX,
            portY,
            portLevel: estado ? estado.infraestrutura.modal_portuario : 0,
            miliciaLevel: estado ? estado.defesa.milicia_local : 0
        };
    });

    // Portos (⚓)
    const portList = nosMapa.filter(n => n.portX !== null && n.portLevel > 0);
    const ports = svg.select("#mapa-portos")
        .selectAll(".port-node")
        .data(portList, d => d.id);

    ports.enter()
        .append("text")
        .attr("class", "port-node")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text("⚓")
        .merge(ports)
        .attr("x", d => d.portX)
        .attr("y", d => d.portY)
        .style("font-size", d => `${10 + d.portLevel * 1.5}px`)
        .style("fill", "var(--header-color)")
        .style("opacity", 0.9)
        .style("cursor", "pointer")
        .attr("filter", "url(#sombra-estado)");

    ports.exit().remove();

    // Capitais (⭐)
    const capList = nosMapa.filter(n => n.capX !== null);
    const capitals = svg.select("#mapa-portos")
        .selectAll(".capital-node")
        .data(capList, d => d.id);

    capitals.enter()
        .append("text")
        .attr("class", "capital-node")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text("⭐")
        .merge(capitals)
        .attr("x", d => d.capX)
        .attr("y", d => d.capY)
        .style("font-size", "11px")
        .style("fill", "#f39c12")
        .style("opacity", 0.95)
        .attr("filter", "url(#sombra-estado)");

    capitals.exit().remove();

    // Defesas (🛡️)
    const defList = nosMapa.filter(n => n.capX !== null && n.miliciaLevel >= 2);
    const defenses = svg.select("#mapa-portos")
        .selectAll(".defense-node")
        .data(defList, d => d.id);

    defenses.enter()
        .append("text")
        .attr("class", "defense-node")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .text("🛡️")
        .merge(defenses)
        .attr("x", d => d.capX + 7)
        .attr("y", d => d.capY - 7)
        .style("font-size", d => `${8 + d.miliciaLevel * 1}px`)
        .style("opacity", 0.85)
        .attr("filter", "url(#sombra-estado)");

    defenses.exit().remove();

    // 4. Rótulos
    const labels = svg.select("#mapa-rotulos")
        .selectAll(".map-label")
        .data(geojson.features, d => d.id);

    labels.enter()
        .append("text")
        .attr("class", "map-label")
        .merge(labels)
        .attr("x", d => pathGenerator.centroid(d)[0])
        .attr("y", d => pathGenerator.centroid(d)[1] + 3)
        .text(d => {
            const estado = state.estados.find(e => e.id === d.id);
            if (!estado) return d.properties.name;
            let nomeCurto = estado.nome.replace("Capitania do ", "").replace("Capitania de ", "").replace("Capitania da ", "").replace("Província do ", "").replace("Província de ", "").replace("Província da ", "");
            if (nomeCurto.length > 15) {
                nomeCurto = nomeCurto.substring(0, 12) + "...";
            }
            return nomeCurto;
        })
        .style("opacity", d => {
            const estado = state.estados.find(e => e.id === d.id);
            if (filtroRegiaoAtual === 'todos' || (estado && estado.regiao === filtroRegiaoAtual)) {
                return 0.85;
            }
            return 0.15;
        });

    labels.exit().remove();

    // 5. Cidades Históricas Emergentes (Fase 3.0)
    // 4.5. Estradas Históricas (Fase 3.1)
    const rotasAtuais = (rotasHistoricas || []).filter(r => r.ano <= state.globais.ano_atual);
    
    const estradasLayer = svg.select("#mapa-estradas")
        .selectAll(".estrada-path")
        .data(rotasAtuais, d => `${d.de}-${d.para}`);
        
    estradasLayer.enter()
        .append("line")
        .attr("class", "estrada-path")
        .style("stroke-width", 1.0)
        .style("opacity", 0)
        .attr("x1", d => {
            const c = cidadesHistoricas.find(x => x.id === d.de);
            return c ? projection(c.coords)[0] : 0;
        })
        .attr("y1", d => {
            const c = cidadesHistoricas.find(x => x.id === d.de);
            return c ? projection(c.coords)[1] : 0;
        })
        .attr("x2", d => {
            const c = cidadesHistoricas.find(x => x.id === d.para);
            return c ? projection(c.coords)[0] : 0;
        })
        .attr("y2", d => {
            const c = cidadesHistoricas.find(x => x.id === d.para);
            return c ? projection(c.coords)[1] : 0;
        })
        .style("stroke", d => d.tipo === "terrestre" ? "#fab387" : "#89b4fa") // Laranja pastel para estradas, azul para rotas marítimas
        .style("stroke-dasharray", d => d.tipo === "terrestre" ? "3,3" : "2,4")
        .transition().duration(800)
        .style("opacity", 0.55);
        
    estradasLayer
        .attr("x1", d => {
            const c = cidadesHistoricas.find(x => x.id === d.de);
            return c ? projection(c.coords)[0] : 0;
        })
        .attr("y1", d => {
            const c = cidadesHistoricas.find(x => x.id === d.de);
            return c ? projection(c.coords)[1] : 0;
        })
        .attr("x2", d => {
            const c = cidadesHistoricas.find(x => x.id === d.para);
            return c ? projection(c.coords)[0] : 0;
        })
        .attr("y2", d => {
            const c = cidadesHistoricas.find(x => x.id === d.para);
            return c ? projection(c.coords)[1] : 0;
        });
        
    estradasLayer.exit().remove();

    // 5. Cidades Históricas Emergentes (Fase 3.0 / 3.1)
    const cidadesAtuais = cidadesHistoricas.filter(c => c.ano_fundacao <= state.globais.ano_atual);
    
    const cidadesLayer = svg.select("#mapa-cidades")
        .selectAll(".cidade-node-group")
        .data(cidadesAtuais, d => d.id);

    const gEnter = cidadesLayer.enter()
        .append("g")
        .attr("class", "cidade-node-group")
        .style("opacity", 0)
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
            const tooltip = document.getElementById('mapa-tooltip');
            const tooltipText = document.getElementById('mapa-tooltip-text');
            if (tooltip && tooltipText) {
                tooltipText.textContent = `🏙️ ${d.nome} (fundada em ${d.ano_fundacao}) — ${d.descricao}`;
                tooltip.classList.add('visivel');
            }
        })
        .on("mousemove", (event) => {
            const tooltip = document.getElementById('mapa-tooltip');
            if (tooltip) {
                const containerRect = document.querySelector('.col-right').getBoundingClientRect();
                const x = event.clientX - containerRect.left - (tooltip.offsetWidth / 2);
                const y = event.clientY - containerRect.top - 40;
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
                tooltip.style.bottom = 'auto';
                tooltip.style.transform = 'none';
            }
        })
        .on("mouseleave", () => {
            const tooltip = document.getElementById('mapa-tooltip');
            if (tooltip) {
                tooltip.classList.remove('visivel');
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.bottom = '16px';
                tooltip.style.top = 'auto';
            }
        });

    // Ícone de casinha colonial sutil (menor que a estrela da capital)
    gEnter.append("path")
        .attr("class", "cidade-icon")
        .attr("d", "M -2.5,2.5 L -2.5,-1 L 0,-3 L 2.5,-1 L 2.5,2.5 Z M -0.8,2.5 L -0.8,0.8 L 0.8,0.8 L 0.8,2.5")
        .style("fill", "#cba6f7") // Roxo pastel
        .style("stroke", "#11111b")
        .style("stroke-width", 0.6);

    // Legenda da cidade
    gEnter.append("text")
        .attr("class", "cidade-label")
        .attr("text-anchor", "middle")
        .attr("y", 8)
        .style("font-size", "6.5px")
        .style("font-weight", "600")
        .style("fill", "var(--text-color)")
        .style("text-shadow", "1px 1px 1px #000")
        .style("pointer-events", "none")
        .text(d => d.nome);

    const cidadesMerge = gEnter.merge(cidadesLayer);
    cidadesMerge.attr("transform", d => {
        const coords = projection(d.coords);
        return coords ? `translate(${coords[0]}, ${coords[1]})` : "translate(0,0)";
    });

    cidadesMerge.transition().duration(800)
        .style("opacity", 0.95);

    cidadesLayer.exit().remove();
}

/**
 * Renderiza o painel da aba Ucronia com gauge, métricas de divergência, gráfico de linha D3 e tabelas.
 * @param {Object} state - Estado atual
 * @param {Object} historiaCanonica - Gabarito histórico real
 */
function renderUchroniaPanel(state, historiaCanonica) {
    let era = state.globais.era_atual;
    let limits = limitesEras[era] || { inicio: 1530, fim: 1822 };
    let anoParaComparar = state.globais.ano_atual;
    let exibindoConsolidadoColonial = false;
    
    let realSnapshots = historiaCanonica && historiaCanonica[era] ? historiaCanonica[era].snapshots : [];
    let realDecisoes = historiaCanonica && historiaCanonica[era] ? historiaCanonica[era].decisoes_canonicas : {};
    
    let divAtual = state.globais.divergencia_atual || 0.0;

    // Se a era for Imperio e não houver dados históricos calibrados para ela, mostramos a divergência consolidada colonial
    if (era === "imperio" && (!realSnapshots || realSnapshots.length === 0)) {
        era = "colonial";
        limits = limitesEras[era] || { inicio: 1530, fim: 1822 };
        anoParaComparar = 1822; // Final da era Colonial
        exibindoConsolidadoColonial = true;
        realSnapshots = historiaCanonica && historiaCanonica[era] ? historiaCanonica[era].snapshots : [];
        realDecisoes = historiaCanonica && historiaCanonica[era] ? historiaCanonica[era].decisoes_canonicas : {};
        
        if (state.globais.historico_jogador && state.globais.historico_jogador.length > 0) {
            const lastColonialSnap = state.globais.historico_jogador.find(snap => snap.ano === 1822);
            if (lastColonialSnap) {
                divAtual = lastColonialSnap.divergencia !== undefined ? lastColonialSnap.divergencia : (state.globais.divergencia_atual || 0.0);
            }
        }
    }
    
    const anoMin = limits.inicio;
    const anoMax = limits.fim;
    const realSnap = lerpSnapshot(realSnapshots, anoParaComparar);
    
    const panel = document.querySelector("#tab-ucronia .ucronia-painel");
    const msgEl = document.getElementById("ucronia-calibragem-mensagem");
    const subDescEl = document.querySelector("#tab-ucronia .header p");
    
    // Se não há dados históricos para a era atual, exibe mensagem amigável
    if (!realSnap) {
        if (panel) panel.style.display = 'none';
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.innerHTML = `
                <p>Os dados históricos para a era <strong>${state.globais.era_atual.toUpperCase()}</strong> ainda não foram calibrados.</p>
                <p style="font-size: 12px; opacity: 0.7;">Para comparar a divergência, jogue na Era Colonial.</p>
            `;
        }
        if (subDescEl) subDescEl.textContent = `Os dados históricos para a era ${state.globais.era_atual.toUpperCase()} ainda não foram calibrados.`;
        return;
    } else {
        if (panel) panel.style.display = 'block';
        if (msgEl) msgEl.style.display = 'none';
        if (subDescEl) {
            if (exibindoConsolidadoColonial) {
                subDescEl.innerHTML = `📊 <strong>Consolidado Final do Período Colonial (1530-1822)</strong>. Exibindo a divergência em relação à história real ao término da era.`;
            } else {
                subDescEl.textContent = `Acompanhe o quanto sua linha temporal está se afastando da história real do Brasil.`;
            }
        }
    }

    // 1. Atualizar Gauge de Divergência
    const valEl = document.getElementById("ucronia-divergencia-valor");
    const statusEl = document.getElementById("ucronia-divergencia-status");
    
    if (valEl) valEl.innerText = `${divAtual.toFixed(1)}%`;
    if (statusEl) {
        let statusText = "Quase Idêntico à História Real";
        let colorClass = "color-verde";
        if (divAtual > 75) {
            statusText = "Universo Paralelo Total";
            colorClass = "color-vermelho";
        } else if (divAtual > 50) {
            statusText = "Universo Alternativo";
            colorClass = "color-vermelho";
        } else if (divAtual > 25) {
            statusText = "Divergência Moderada";
            colorClass = "color-amarelo";
        } else if (divAtual > 10) {
            statusText = "Leve Divergência Histórica";
            colorClass = "color-verde";
        }
        statusEl.innerText = statusText;
        statusEl.className = `gauge-status ${colorClass}`;
    }

    // Desenha o Semicirculo SVG
    drawGauge(divAtual);

    // 2. Atualizar Barras de Dimensão
    const dimList = document.getElementById("ucronia-dimensoes-lista");
    if (dimList) {
        let playerSnap = null;
        if (exibindoConsolidadoColonial && state.globais.historico_jogador) {
            playerSnap = state.globais.historico_jogador.find(snap => snap.ano === 1822);
        }
        if (!playerSnap) {
            playerSnap = capturarSnapshot(state);
        }
        
        const getBarClass = (s) => s < 0.20 ? 'dim-verde' : (s < 0.50 ? 'dim-amarelo' : 'dim-vermelho');
        const getPctText = (s) => `${(s * 100).toFixed(0)}%`;

        // 1. PIB
        const diff_pib = Math.abs(playerSnap.pib_nacional - realSnap.pib_nacional) / (realSnap.pib_nacional || 1);
        const score_pib = Math.min(1.0, diff_pib);

        // 2. Tesouro
        const diff_tesouro = Math.abs(playerSnap.tesouro - realSnap.tesouro) / Math.max(Math.abs(realSnap.tesouro), 50.0);
        const score_tesouro = Math.min(1.0, diff_tesouro);

        // 3. Populacao
        const diff_pop = Math.abs(playerSnap.populacao_total - realSnap.populacao_total) / (realSnap.populacao_total || 1);
        const score_pop = Math.min(1.0, diff_pop);

        // 4. Estabilidade
        const diff_revolta = Math.abs(playerSnap.media_revolta - realSnap.media_revolta) / 100.0;
        const score_revolta = Math.min(1.0, diff_revolta);

        // 5. Infraestrutura
        const portos_player = playerSnap.infraestrutura_media.portos;
        const portos_real = realSnap.infraestrutura_media.portos;
        const estradas_player = playerSnap.infraestrutura_media.estradas;
        const estradas_real = realSnap.infraestrutura_media.estradas;
        const diff_portos = Math.abs(portos_player - portos_real) / Math.max(portos_real, 1.0);
        const diff_estradas = Math.abs(estradas_player - estradas_real) / Math.max(estradas_real, 1.0);
        const score_infra = Math.min(1.0, (diff_portos + diff_estradas) / 2.0);

        // 6. Decisoes
        let totalDecisoes = 0;
        let ucroneas = 0;
        if (state.globais.decisoes_historicas && state.globais.decisoes_historicas.length > 0) {
            state.globais.decisoes_historicas.forEach(d => {
                const canonicalOpt = realDecisoes[d.evento_id];
                if (canonicalOpt !== undefined) {
                    totalDecisoes++;
                    if (d.opcao_escolhida !== canonicalOpt) {
                        ucroneas++;
                    }
                }
            });
        }
        const score_decisoes = totalDecisoes > 0 ? (ucroneas / totalDecisoes) : 0.0;

        dimList.innerHTML = `
            <div class="dimensao-item">
                <div class="dimensao-label">
                    <span>PIB Nacional (25%)</span>
                    <span>${getPctText(score_pib)}</span>
                </div>
                <div class="dimensao-barra-bg">
                    <div class="dimensao-barra-preenchimento ${getBarClass(score_pib)}" style="width: ${score_pib * 100}%;"></div>
                </div>
            </div>
            <div class="dimensao-item">
                <div class="dimensao-label">
                    <span>Tesouro Nacional (15%)</span>
                    <span>${getPctText(score_tesouro)}</span>
                </div>
                <div class="dimensao-barra-bg">
                    <div class="dimensao-barra-preenchimento ${getBarClass(score_tesouro)}" style="width: ${score_tesouro * 100}%;"></div>
                </div>
            </div>
            <div class="dimensao-item">
                <div class="dimensao-label">
                    <span>População Total (10%)</span>
                    <span>${getPctText(score_pop)}</span>
                </div>
                <div class="dimensao-barra-bg">
                    <div class="dimensao-barra-preenchimento ${getBarClass(score_pop)}" style="width: ${score_pop * 100}%;"></div>
                </div>
            </div>
            <div class="dimensao-item">
                <div class="dimensao-label">
                    <span>Estabilidade Social (15%)</span>
                    <span>${getPctText(score_revolta)}</span>
                </div>
                <div class="dimensao-barra-bg">
                    <div class="dimensao-barra-preenchimento ${getBarClass(score_revolta)}" style="width: ${score_revolta * 100}%;"></div>
                </div>
            </div>
            <div class="dimensao-item">
                <div class="dimensao-label">
                    <span>Infraestrutura Média (15%)</span>
                    <span>${getPctText(score_infra)}</span>
                </div>
                <div class="dimensao-barra-bg">
                    <div class="dimensao-barra-preenchimento ${getBarClass(score_infra)}" style="width: ${score_infra * 100}%;"></div>
                </div>
            </div>
            <div class="dimensao-item">
                <div class="dimensao-label">
                    <span>Decisões Históricas (20%)</span>
                    <span>${totalDecisoes > 0 ? `${ucroneas}/${totalDecisoes} ⚡` : 'Nenhuma'} (${getPctText(score_decisoes)})</span>
                </div>
                <div class="dimensao-barra-bg">
                    <div class="dimensao-barra-preenchimento ${getBarClass(score_decisoes)}" style="width: ${score_decisoes * 100}%;"></div>
                </div>
            </div>
        `;
    }

    // 3. Desenhar Gráfico D3
    drawChart(state, realDecisoes, anoMin, anoMax);

    // 4. Preencher Diário de Decisões
    const decisionsBody = document.getElementById("ucronia-decisoes-body");
    if (decisionsBody) {
        const decisionsInEra = (state.globais.decisoes_historicas || [])
            .filter(d => d.ano >= anoMin && d.ano <= anoMax)
            .sort((a, b) => a.ano - b.ano);

        if (decisionsInEra.length === 0) {
            decisionsBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; opacity: 0.6; padding: 15px;">Nenhuma decisão de bifurcação tomada ainda nesta era.</td>
                </tr>
            `;
        } else {
            decisionsBody.innerHTML = decisionsInEra.map(dec => {
                const canonicalOpt = realDecisoes[dec.evento_id];
                const ehCanonica = dec.opcao_escolhida === canonicalOpt;
                const badge = ehCanonica 
                    ? '<span class="color-verde">✅ Histórica</span>' 
                    : '<span class="color-amarelo">⚡ Ucrônica</span>';
                
                return `
                    <tr>
                        <td style="font-weight: bold;">${dec.ano}</td>
                        <td>${dec.nome_evento}</td>
                        <td>${dec.nome_opcao}</td>
                        <td>${badge}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    // 5. Preencher Tabela Comparativa Lado a Lado
    const compBody = document.getElementById("ucronia-comparacao-body");
    if (compBody) {
        let playerSnap = null;
        if (exibindoConsolidadoColonial && state.globais.historico_jogador) {
            playerSnap = state.globais.historico_jogador.find(snap => snap.ano === 1822);
        }
        if (!playerSnap) {
            playerSnap = capturarSnapshot(state);
        }

        const formatMoeda = v => `$${v.toFixed(2)}`;
        const formatNumber = v => Math.round(v).toLocaleString('pt-BR');
        const formatPct = v => `${v.toFixed(1)}%`;
        const formatDecimal = v => v.toFixed(2);

        let labelDefesa = "Milícia (média)";
        if (era === "imperio") labelDefesa = "Guarda Nacional (média)";
        else if (era === "republica") labelDefesa = "Forças Armadas (média)";

        let html = "";
        html += formatComparisonRow("PIB Nacional", realSnap.pib_nacional, playerSnap.pib_nacional, formatMoeda);
        html += formatComparisonRow("Tesouro Nacional", realSnap.tesouro, playerSnap.tesouro, formatMoeda);
        html += formatComparisonRow("População Total", realSnap.populacao_total, playerSnap.populacao_total, formatNumber);
        html += formatComparisonRow("Média de Revolta", realSnap.media_revolta, playerSnap.media_revolta, formatPct, true);
        html += formatComparisonRow("Portos (média)", realSnap.infraestrutura_media.portos, playerSnap.infraestrutura_media.portos, formatDecimal);
        html += formatComparisonRow("Estradas (média)", realSnap.infraestrutura_media.estradas, playerSnap.infraestrutura_media.estradas, formatDecimal);
        html += formatComparisonRow(labelDefesa, realSnap.milicia_media, playerSnap.milicia_media, formatDecimal);

        compBody.innerHTML = html;
    }
}

function drawGauge(value) {
    const svg = d3.select("#ucronia-gauge");
    svg.selectAll("*").remove();

    const width = 200;
    const height = 110;
    const cx = width / 2;
    const cy = 95;
    const rOuter = 70;
    const rInner = 50;

    const g = svg.append("g");

    const arcGenerator = d3.arc()
        .innerRadius(rInner)
        .outerRadius(rOuter)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

    const defs = svg.append("defs");
    const grad = defs.append("linearGradient")
        .attr("id", "gauge-grad")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    const isModern = document.body.getAttribute("data-theme") === "moderno" || document.body.dataset.era === "imperio";
    const greenColor = isModern ? "#a6e3a1" : "#2e7d32";
    const yellowColor = isModern ? "#f9e2af" : "#b7791f";
    const redColor = isModern ? "#f38ba8" : "#c53030";

    grad.append("stop").attr("offset", "0%").attr("stop-color", greenColor);
    grad.append("stop").attr("offset", "50%").attr("stop-color", yellowColor);
    grad.append("stop").attr("offset", "100%").attr("stop-color", redColor);

    g.append("path")
        .attr("d", arcGenerator())
        .attr("transform", `translate(${cx}, ${cy})`)
        .attr("fill", "url(#gauge-grad)")
        .attr("opacity", 0.85);

    const angle = -90 + (value / 100) * 180;
    const rad = (angle * Math.PI) / 180;
    const needleLength = rOuter - 5;
    const nx = cx + needleLength * Math.sin(rad);
    const ny = cy - needleLength * Math.cos(rad);

    const needleColor = isModern ? "#cbd5e1" : "#3b2f2f";

    g.append("line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", nx)
        .attr("y2", ny)
        .attr("stroke", needleColor)
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round");

    g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 6)
        .attr("fill", needleColor);
}

function drawChart(state, realDecisoes, anoMin, anoMax) {
    const svg = d3.select("#ucronia-chart");
    svg.selectAll("*").remove();

    const width = 420;
    const height = 220;
    const margin = { top: 15, right: 15, bottom: 35, left: 30 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([anoMin, anoMax]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const isModern = document.body.getAttribute("data-theme") === "moderno" || state.globais.era_atual === "imperio";
    const greenColor = isModern ? "#a6e3a1" : "#2e7d32";
    const colorFaixaVerde = isModern ? "rgba(166, 227, 161, 0.05)" : "rgba(46, 125, 50, 0.05)";
    const colorFaixaAmarela = isModern ? "rgba(249, 226, 175, 0.05)" : "rgba(245, 127, 23, 0.05)";
    const colorFaixaVermelha = isModern ? "rgba(243, 139, 168, 0.05)" : "rgba(211, 47, 47, 0.05)";

    // Faixas
    chartGroup.append("rect")
        .attr("x", 0)
        .attr("y", yScale(20))
        .attr("width", chartWidth)
        .attr("height", yScale(0) - yScale(20))
        .attr("fill", colorFaixaVerde);

    chartGroup.append("rect")
        .attr("x", 0)
        .attr("y", yScale(50))
        .attr("width", chartWidth)
        .attr("height", yScale(20) - yScale(50))
        .attr("fill", colorFaixaAmarela);

    chartGroup.append("rect")
        .attr("x", 0)
        .attr("y", yScale(100))
        .attr("width", chartWidth)
        .attr("height", yScale(50) - yScale(100))
        .attr("fill", colorFaixaVermelha);

    // Eixos
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d"));
    chartGroup.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => d + "%");
    chartGroup.append("g")
        .attr("class", "chart-axis")
        .call(yAxis);

    // Grid lines
    [20, 50, 80].forEach(tickVal => {
        chartGroup.append("line")
            .attr("x1", 0)
            .attr("x2", chartWidth)
            .attr("y1", yScale(tickVal))
            .attr("y2", yScale(tickVal))
            .attr("stroke", isModern ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")
            .attr("stroke-dasharray", "2 2");
    });

    // Linha real
    chartGroup.append("line")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("class", "chart-line-real");

    // Linha jogador
    const points = (state.globais.historico_jogador || [])
        .filter(d => d.ano >= anoMin && d.ano <= anoMax)
        .sort((a, b) => a.ano - b.ano);

    const lineGenerator = d3.line()
        .x(d => xScale(d.ano))
        .y(d => yScale(d.divergencia !== undefined ? d.divergencia : 0.0))
        .curve(d3.curveMonotoneX);

    if (points.length > 0) {
        chartGroup.append("path")
            .datum(points)
            .attr("class", "chart-line-jogador")
            .attr("d", lineGenerator);
    }

    // Bifurcações
    const decisionsInEra = (state.globais.decisoes_historicas || [])
        .filter(d => d.ano >= anoMin && d.ano <= anoMax);

    const dotsGroup = chartGroup.append("g").attr("class", "chart-dots-group");
    const tooltip = d3.select("#chart-tooltip");

    decisionsInEra.forEach(dec => {
        const pt = points.find(p => p.ano === dec.ano) || points.reduce((prev, curr) => {
            return Math.abs(curr.ano - dec.ano) < Math.abs(prev.ano - dec.ano) ? curr : prev;
        }, points[0]);

        if (!pt) return;

        const divVal = pt.divergencia !== undefined ? pt.divergencia : 0.0;
        const canonicalOpt = realDecisoes[dec.evento_id];
        const ehCanonica = dec.opcao_escolhida === canonicalOpt;
        const dotColor = ehCanonica ? greenColor : (isModern ? "#f9e2af" : "#b7791f");

        const dot = dotsGroup.append("circle")
            .attr("cx", xScale(dec.ano))
            .attr("cy", yScale(divVal))
            .attr("r", 5)
            .attr("fill", dotColor)
            .attr("stroke", isModern ? "#1e293b" : "#dbcaa5")
            .attr("stroke-width", 1.5)
            .attr("class", "chart-dot");

        dot.on("mouseover", (event) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`
                <strong>Ano ${dec.ano}: ${dec.nome_evento}</strong><br/>
                Escolha: ${dec.nome_opcao} ${ehCanonica ? '✅ (Real)' : '⚡ (Ucrônica)'}<br/>
                Divergência: ${divVal.toFixed(1)}%
            `);
            
            const [mx, my] = d3.pointer(event, svg.node());
            tooltip
                .style("left", `${mx}px`)
                .style("top", `${my - 45}px`);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
    });
}

function lerpSnapshot(snapshots, ano) {
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

function formatComparisonRow(metricLabel, realVal, playerVal, formatFn, lowerIsBetter = false) {
    const diff = playerVal - realVal;
    let deltaHTML = "";
    if (Math.abs(realVal) > 0.001) {
        const pct = (diff / realVal) * 100;
        if (Math.abs(pct) < 0.1) {
            deltaHTML = `<span style="opacity: 0.6;">=</span>`;
        } else {
            const arrow = pct > 0 ? "↑" : "↓";
            const sign = pct > 0 ? "+" : "";
            const isGreen = (pct > 0 && !lowerIsBetter) || (pct < 0 && lowerIsBetter);
            const colorClass = isGreen ? "color-verde" : "color-vermelho";
            deltaHTML = `<span class="${colorClass}">${arrow} ${sign}${pct.toFixed(1)}%</span>`;
        }
    } else {
        deltaHTML = `<span style="opacity: 0.6;">-</span>`;
    }
    return `
        <tr>
            <td style="font-weight: bold;">${metricLabel}</td>
            <td style="text-align: right;">${formatFn(realVal)}</td>
            <td style="text-align: right;">${formatFn(playerVal)}</td>
            <td style="text-align: right;">${deltaHTML}</td>
        </tr>
    `;
}

/**
 * Configura os event listeners específicos da Biblioteca Histórica.
 */
function setupBibliotecaListeners() {
    document.querySelectorAll('.biblioteca-secao-header').forEach(header => {
        header.addEventListener('click', () => {
            const secaoId = header.dataset.secao;
            const secaoBody = document.getElementById(secaoId);
            const seta = header.querySelector('.biblioteca-seta');
            
            if (secaoBody) {
                const isOpen = secaoBody.classList.contains('aberto');
                if (isOpen) {
                    secaoBody.classList.remove('aberto');
                    if (seta) seta.innerText = '▼';
                } else {
                    secaoBody.classList.add('aberto');
                    if (seta) seta.innerText = '▲';
                }
            }
        });
    });

    const buscaInput = document.getElementById('biblioteca-busca');
    if (buscaInput) {
        buscaInput.addEventListener('input', () => {
            renderBiblioteca(currentState);
        });
    }
}

/**
 * Renderiza a aba Biblioteca Histórica (Enciclopédia).
 * @param {Object} state - O estado do jogo atualizado.
 */
function renderBiblioteca(state) {
    const era = state.globais.era_atual;
    const anoAtual = state.globais.ano_atual;
    const buscaInput = document.getElementById('biblioteca-busca');
    const query = buscaInput ? buscaInput.value.toLowerCase().trim() : '';

    const timelineBody = document.getElementById('timeline-body');
    const ciclosBody = document.getElementById('ciclos-body');
    const personalidadesBody = document.getElementById('personalidades-body');
    const territoriosBody = document.getElementById('territorios-body');

    if (!timelineBody || !ciclosBody || !personalidadesBody || !territoriosBody) return;

    const matchesQuery = (text) => {
        if (!query) return true;
        return (text || '').toLowerCase().includes(query);
    };

    // 1. Linha do Tempo
    const timelineEntries = enciclopedia.linha_do_tempo.filter(item => {
        const eraOrdem = { colonial: 1, imperio: 2, republica: 3 };
        const itemEraOrdem = eraOrdem[item.era] || 99;
        const currentEraOrdem = eraOrdem[era] || 99;
        
        if (itemEraOrdem > currentEraOrdem) return false;
        if (item.ano > anoAtual) return false;

        return matchesQuery(item.titulo) || matchesQuery(item.descricao) || matchesQuery(item.ano.toString());
    });

    if (timelineEntries.length === 0) {
        timelineBody.innerHTML = `<p style="opacity: 0.6; font-size: 11px; text-align: center; margin-top: 10px;">Nenhum marco histórico encontrado.</p>`;
    } else {
        timelineBody.innerHTML = timelineEntries.map(item => {
            const decisaoJogador = (state.globais.decisoes_historicas || []).find(d => d.ano === item.ano);
            let playerChoiceHTML = '';
            if (decisaoJogador) {
                playerChoiceHTML = `
                    <div style="margin-top: 6px; padding: 6px 8px; background: rgba(137, 180, 250, 0.08); border-left: 2.5px solid #89b4fa; border-radius: 0 4px 4px 0; font-size: 10px;">
                        ⚡ <strong>Sua Escolha:</strong> ${decisaoJogador.nome_opcao}
                    </div>
                `;
            }
            return `
                <div class="timeline-item ${item.tipo || 'marco'}">
                    <div class="timeline-item-header">
                        <span class="timeline-item-ano">${item.ano}</span>
                        <span class="timeline-item-titulo">${item.titulo}</span>
                    </div>
                    <div class="timeline-item-desc">${item.descricao}</div>
                    ${playerChoiceHTML}
                </div>
            `;
        }).join('');
    }

    // 2. Ciclos Econômicos
    const ciclosEntries = enciclopedia.ciclos.filter(item => {
        const eraOrdem = { colonial: 1, imperio: 2, republica: 3 };
        const itemEraOrdem = eraOrdem[item.era] || 99;
        const currentEraOrdem = eraOrdem[era] || 99;
        
        if (itemEraOrdem > currentEraOrdem) return false;
        
        return matchesQuery(item.nome) || matchesQuery(item.descricao) || matchesQuery(item.periodo);
    });

    if (ciclosEntries.length === 0) {
        ciclosBody.innerHTML = `<p style="opacity: 0.6; font-size: 11px; text-align: center; margin-top: 10px;">Nenhum ciclo econômico encontrado.</p>`;
    } else {
        ciclosBody.innerHTML = ciclosEntries.map(item => `
            <div class="bib-card">
                <div class="bib-card-header">
                    <span class="bib-card-title">${item.icone} ${item.nome}</span>
                    <span class="bib-card-meta">${item.periodo}</span>
                </div>
                <div class="bib-card-desc">${item.descricao}</div>
                <div class="bib-card-desc" style="font-size: 10px; opacity: 0.8; margin-bottom: 0;">💡 <em>Curiosidade:</em> ${item.curiosidades}</div>
                <div class="bib-card-impact"><strong>Mecânica:</strong> ${item.impacto_mecanico}</div>
            </div>
        `).join('');
    }

    // 3. Personalidades
    const personalidadesEntries = enciclopedia.personalidades.filter(item => {
        const eraOrdem = { colonial: 1, imperio: 2, republica: 3 };
        const itemEraOrdem = eraOrdem[item.era] || 99;
        const currentEraOrdem = eraOrdem[era] || 99;
        
        if (itemEraOrdem > currentEraOrdem) return false;

        return matchesQuery(item.nome) || matchesQuery(item.descricao) || matchesQuery(item.cargo) || matchesQuery(item.periodo);
    });

    if (personalidadesEntries.length === 0) {
        personalidadesBody.innerHTML = `<p style="opacity: 0.6; font-size: 11px; text-align: center; margin-top: 10px;">Nenhuma personalidade encontrada.</p>`;
    } else {
        personalidadesBody.innerHTML = personalidadesEntries.map(item => `
            <div class="bib-card">
                <div class="bib-card-header">
                    <span class="bib-card-title">${item.icone} ${item.nome}</span>
                    <span class="bib-card-meta">${item.periodo}</span>
                </div>
                <div style="font-size: 10px; font-weight: bold; margin-bottom: 6px; opacity: 0.7;">${item.cargo}</div>
                <div class="bib-card-desc">${item.descricao}</div>
                <div class="bib-card-impact" style="background: rgba(137, 180, 250, 0.08); border-left-color: #89b4fa;"><strong>Relação com o Jogo:</strong> ${item.relacao_jogo}</div>
            </div>
        `).join('');
    }

    // 4. Territórios
    const territoriosEntries = enciclopedia.territorios.filter(item => {
        const eraOrdem = { colonial: 1, imperio: 2, republica: 3 };
        const itemEraOrdem = eraOrdem[item.era] || 99;
        const currentEraOrdem = eraOrdem[era] || 99;
        
        if (itemEraOrdem > currentEraOrdem) return false;

        return matchesQuery(item.nome) || matchesQuery(item.descricao) || matchesQuery(item.donatario);
    });

    if (territoriosEntries.length === 0) {
        territoriosBody.innerHTML = `<p style="opacity: 0.6; font-size: 11px; text-align: center; margin-top: 10px;">Nenhum território encontrado.</p>`;
    } else {
        territoriosBody.innerHTML = territoriosEntries.map(item => {
            const estadoObj = state.estados.find(e => e.id === item.id);
            let statsHTML = '';
            if (estadoObj) {
                const pibText = estadoObj.economia.pib_total.toFixed(1);
                const revoltaText = estadoObj.defesa.indice_revolta.toFixed(0);
                const pacificado = estadoObj.status_territorio || 'controlado';
                statsHTML = `
                    <div style="margin-top: 6px; display: flex; gap: 10px; font-size: 9.5px; opacity: 0.8; background: rgba(0,0,0,0.05); padding: 4px 6px; border-radius: 4px; border: 1px dashed var(--panel-border);">
                        <span>💰 PIB: $${pibText}</span>
                        <span>🔥 Revolta: ${revoltaText}%</span>
                        <span style="text-transform: uppercase;">🛡️ Status: ${pacificado}</span>
                    </div>
                `;
            }
            return `
                <div class="bib-card">
                    <div class="bib-card-header">
                        <span class="bib-card-title">🗺️ ${item.nome}</span>
                        <span class="bib-card-meta">Fundação: ${item.fundacao}</span>
                    </div>
                    <div style="font-size: 10px; font-weight: bold; margin-bottom: 6px; opacity: 0.7;">Donatário: ${item.donatario}</div>
                    <div class="bib-card-desc">${item.descricao}</div>
                    <div class="bib-card-desc" style="font-size: 10px; opacity: 0.8; margin-bottom: 0;">💡 <em>Curiosidades:</em> ${item.curiosidades || ''}</div>
                    ${statsHTML}
                </div>
            `;
        }).join('');
    }
}

