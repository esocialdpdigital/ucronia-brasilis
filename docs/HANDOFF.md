# HANDOFF — Ucronia Brasilis
## Guia de Onboarding para o Próximo Agente de IA

**Data de criação:** 22/06/2026 (Atualizado)  
**Fase atual do projeto:** 3.1 Concluída / 4.0 em Planejamento (Aprovado)  
**Servidor de dev:** `node scripts/server.js` → http://localhost:8080  
**GDD Mestre:** `docs/GDD_Master.md`  
**Diário de bordo técnico:** `docs/DEV_LOG.md`

---

## 1. O Que é Este Projeto?

**Ucronia Brasilis** é um simulador estratégico web, rodando 100% no navegador (sem backend), focado na história do Brasil colonial. O jogador controla as capitanias hereditárias de 1530, tomando decisões políticas, econômicas e militares que alteram o rumo da história real.

### Stack Tecnológica
- **HTML/JS/CSS puro** — sem frameworks (exceto D3.js para mapas via CDN)
- **ES Modules nativos** (`import/export`)
- **Servidor local simples:** `scripts/server.js` (Node.js puro, sem npm) na porta 8080
- **Persistência:** `localStorage` via `JSON.stringify/parse` do `GameState`
- **Mapas:** D3.js v7 com GeoJSON customizado

### Para rodar localmente:
```bash
node scripts/server.js
# Acesse http://localhost:8080 no navegador
```

---

## 2. Arquitetura Obrigatória (LEIA ANTES DE EDITAR)

O projeto segue **Clean Architecture** estrita com 4 camadas. **Nunca quebre essas fronteiras:**

```
[data/]           → Arquivos JS declarativos de dados (sem lógica)
    ↓ importado por
[src/gameState.js] → Estado global puro (100% serializável, sem funções)
    ↓ passado para
[src/simulationEngine.js] → Funções PURAS que recebem e retornam newState
    ↓ passado para
[src/eventManager.js]     → Avalia triggers, injeta efeitos no estado
    ↓ passado para
[src/view.js]             → Renderiza o DOM/D3 a partir do estado (SÓ lê, não calcula)
```

### Fluxo de um turno (1 ano):
```js
// Em view.js, ao clicar "Avançar Ano":
applyPlayerDecisions();              // Lê sliders → atualiza currentState
currentState = advanceYear(currentState);  // Engine: cálculos econômicos
currentState = checkEvents(currentState);  // EventManager: dispara eventos
updateInterface(currentState);            // View: re-renderiza tudo
localStorage.setItem(...);                // Auto-save
```

### Regras invioláveis:
1. **`GameState` deve ser 100% serializável.** Nunca adicionar funções ou referências circulares.
2. **A Engine não guarda estado interno.** `advanceYear()` é uma função pura.
3. **A View não calcula regras de negócio.** Só lê e renderiza.
4. **Novos dados = novo arquivo em `data/`.** Nunca hardcode dados na engine ou view.

---

## 3. Estado Atual do Código (Fase 3.1 — Concluída)

### O que está 100% funcional:
| Feature | Onde |
|---------|------|
| 12 Capitanias coloniais com dados históricos | `data/capitanias_1534.js` |
| Motor econômico (Pau-Brasil, Açúcar, Ouro, Café) | `src/simulationEngine.js` |
| 8 Eventos históricos com bifurcações e imagens IA | `data/eventos_colonial.js` + `src/eventManager.js` |
| Mapa D3 interativo com zoom/pan e marcadores | `src/view.js` → `renderMapD3()` |
| Cidades Históricas e Rotas que surgem dinamicamente | `data/cidades_historicas.js` + `src/view.js` |
| Sistema de Divergência Histórica Calibrado | `src/view.js` + `data/historia_canonica.js` |
| Diário de Bordo (logs anuais e decisões do jogador) | `src/view.js` (Pergaminho modal superior) |
| Alíquota Fiscal Geral (slider de macro controle) | `src/view.js` + `src/simulationEngine.js` |
| Efeitos Sonoros Sintetizados (Web Audio API) | `src/view.js` (com botão de mudo persistente) |
| Biblioteca Enciclopédica (Ciclos, Províncias, Personalidades) | `data/enciclopedia.js` + `src/view.js` |
| Transição de Era (Colonial → Imperial) | `src/gameState.js` → `transitionToEra()` |
| Modal estilizado para Bandeiras (expiração 1690) | `src/view.js` + `index.html` |
| Modais de Confirmação estilizados (Reiniciar/Limpar) | `src/view.js` (substitui prompt nativo) |
| Menu de abas fixo (sticky) e tooltips | `src/styles.css` + `src/view.js` |
| Save/Load/AutoSave e persistência de Socorro Régio | `src/view.js` |
| Rankings locais e persistência de dados | `src/view.js` → `registrarPontuacaoEra()` |

### Arquivos e seus tamanhos atuais:
| Arquivo | Linhas | Função Principal |
|---------|--------|-----------------|
| `src/view.js` | ~2374 | Controladora completa da UI, D3 e Modais |
| `src/simulationEngine.js` | ~610 | Motor de regras puro e cálculos de desvio |
| `src/eventManager.js` | ~350 | Disparo de eventos e bifurcações |
| `src/gameState.js` | ~137 | Factory do estado inicial e transição de era |
| `data/eventos_colonial.js` | ~265 | Declaração dos 8 eventos coloniais |
| `data/historia_canonica.js` | ~801 | Gabarito histórico real (gerado) |
| `data/cidades_historicas.js` | ~98 | Banco de dados de cidades e estradas |
| `data/enciclopedia.js` | ~360 | Banco de dados da Biblioteca |
| `index.html` | ~451 | HTML da SPA (modais, abas, SVG D3) |
| `src/styles.css` | ~1619 | Estilos por era, temas e Biblioteca |

---

## 4. Próxima Tarefa: Fase 4.0 — A Era do Império (1822–1889)

A Era do Império representa um marco de escala de jogabilidade no *Ucronia Brasilis*. O jogador fará a transição de um território de 12 capitanias agrícolas para uma federação de 20 províncias integradas (definidas em `data/estados_1822.js`), herdando modificadores ucrônicos das decisões da era colonial, ativando novos modais (ferrovias), o Ciclo do Café e as ações do Poder Moderador.

### STEP 1 — Integração do Estado de 1822 (`gameState.js` & `data/estados_1822.js`)
- Mapear a transição das 12 capitanias coloniais para as 20 províncias imperiais listadas em `data/estados_1822.js` usando a matriz de pesos em `data/provincia_mapping.js`.
- Garantir que a fábrica de transição (`transitionToEra`) inicialize os estados de 1822 contendo os campos de territórios inacessíveis (`status_territorio`, `invadido_por`, `duracao_invasao`) para manter a retrocompatibilidade da engine.

### STEP 2 — Ativação de Recursos do Império na Engine (`simulationEngine.js`)
- **Ciclo do Café:** Ativar taxa de crescimento acelerado (+12%/ano) para províncias com vocação de café e infraestrutura adequada (São Paulo, Rio de Janeiro, Minas Gerais) após 1830.
- **Ferrovias:** A infraestrutura terrestre que atinge nível 2 ou superior no Império deve ser desenhada como trilhos ferroviários no mapa D3. Ferrovias aumentam o PIB local em +5%/ano.
- **Poder Moderador:** Adicionar ações governamentais do Imperador (como dissolver a câmara ou decretar impostos régios à força) com alto custo de descontentamento social, mas retorno financeiro rápido.

### STEP 3 — Eventos e Revoltas Regenciais (`eventManager.js` & `data/eventos_imperial.js`)
- Criar `data/eventos_imperial.js` contendo triggers para:
  - **Revoltas Regenciais (1831–1848):** Farroupilha (RS), Cabanagem (PA), Sabinada (BA) e Balaiada (MA). Se o descontentamento for alto, essas províncias adquirem `status_territorio = "rebelado"`.
  - **Guerra do Paraguai (1864):** Evento global com exigência de arrecadação extraordinária e recrutamento voluntário ou forçado.
  - **Questão Abolicionista (1888):** Escolha da Lei Áurea. Assinar a abolição reduz drasticamente o PIB de províncias agrícolas tradicionais (Rio de Janeiro/Minas Gerais), mas eleva a estabilidade nacional e zera a revolta popular. Recusar gera rebeliões de escravizados e pode causar a queda do Império (fim de jogo).

### STEP 4 — Mapa e Camada Visual do Império (`view.js`)
- Assegurar que o D3 carregue o GeoJSON correto de 1822 (`data/mapas/estados_1822_geojson.js`) ao transicionar de era, aplicando zoom e pan de forma fluida.
- Readequar a renderização de rótulos de províncias e conexões ferroviárias/estradas dinâmicas.

---

## 5. Pontos de Atenção e Armadilhas Conhecidas

### ⚠️ Matriz de Redistribuição Ucrônica
Durante a transição ucrônica, a engine calcula o PIB inicial da província imperial somando as contribuições ponderadas das capitanias coloniais (definidas em `data/provincia_mapping.js`). Certifique-se de que a soma dos pesos de origem para cada província seja consistente para não gerar distorções financeiras bizarras (ex: províncias iniciando com PIB bilionário).

### ⚠️ Calibragem de Divergência no Império
Ao implementar turnos e avançar os anos imperiais, garanta que `data/historia_canonica.js` contenha um array calibrado de snapshots para a era `"imperio"`. Sem esses dados, a aba Ucronia mostrará a mensagem de consolidado colonial (o que é correto para teste, mas a meta é ter dados imperiais comparáveis).

---

## 6. Referências Rápidas

### IDs dos elementos HTML principais
| Elemento | ID | Função |
|----------|-----|--------|
| Botão Avançar | `btn-avancar` | Avança 1 ano |
| Ano atual | `ano_atual` | Exibe o ano |
| Tesouro | `tesouro_nacional` | Exibe o caixa |
| Modal de evento | `modal-evento-bifurcacao` | Modal de bifurcação |
| Modal conselho | `modal-conselho` | Alertas do conselheiro |
| Modal bandeiras | `modal-bandeiras` | Modal das bandeiras |
| Mapa D3 SVG | `mapa-d3` | Container do mapa |
| Zoom group | `map-zoom-group` | Camadas do mapa (zoom/pan) |
| Tooltip do mapa | `mapa-tooltip` | Tooltip de hover no mapa |
| Game tooltip | `game-tooltip` | Tooltip dos `data-tooltip-game` |
| Cards container | `cards-container` | Container dos cartões de territórios |

### Camadas do Mapa D3 (dentro de `#map-zoom-group`)
| Camada | ID | O que renderiza |
|--------|-----|-----------------|
| Polígonos | `mapa-regioes` | Províncias de 1822 |
| Estradas/Trilhos | `mapa-estradas` | Estradas coloniais + ferrovias do império |
| Portos/Capitais | `mapa-portos` | Âncoras ⚓, Estrelas ⭐ e Escudos 🛡️ |
| Cidades | `mapa-cidades` | Casinhas roxas 🏠 e legendas |

---

## 7. Checklist de Verificação da Fase 4.0

Após implementar a Fase 4.0, verificar:
- [ ] O botão "Avançar Era" surge no ano 1822.
- [ ] Transição Ucrônica: verificar se o Tesouro Nacional herda +150 Contos e Pernambuco/Bahia/Rio de Janeiro ganham +10% PIB caso tenha resistido à União Ibérica e mantido autonomia em 1640.
- [ ] Escolher transição e conferir se o mapa D3 se redesenha com as 20 províncias do Império.
- [ ] Sliders e cartões são sincronizados with as novas 20 províncias.
- [ ] Ações do Poder Moderador na aba Governo ativam e modificam Tesouro e Revolta conforme especificado.
- [ ] Eventos da Cabanagem no Grão-Pará travam os controles do cartão da província, marcando status como `"rebelado"` e a pintam em vermelho escuro de revolta no mapa.
- [ ] Construir ferrovia em São Paulo (infraestrutura de transporte >= 2) muda o traçado no mapa para o padrão de trilhos e ativa +12% de crescimento de café.
- [ ] A abolição da escravidão em 1888 gera impacto econômico (queda de PIB no Sudeste cafeeiro) e desbloqueia a transição para a República. Vetar a Lei Áurea leva ao colapso do Império (Game Over por revolta >75% em 1889).

---

*Documento gerado em 22/06/2026 pela equipe de desenvolvimento. Para dúvidas sobre decisões arquiteturais anteriores, consultar `docs/DEV_LOG.md` (todas as sessões documentadas).*
