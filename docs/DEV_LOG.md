# Diário de Bordo Técnico (DEV_LOG) - Ucronia Brasilis

Este documento serve como diário de desenvolvimento e guia de integração para contextualizar novas IAs ou desenvolvedores humanos sobre a saúde do projeto, a organização dos arquivos e os objetivos pendentes.

---

## 1. Status do Código (Saúde e Funcionalidades — Sessão 15/06/2026)

A engine, a camada visual e o sistema de persistência estão completamente funcionais, integrados e testados. Foram concluídas duas fases de evolução do projeto hoje:

### Correções e Implementações da Sessão 1 (Bugs Críticos + Save/Load):

*   **Persistência de Eventos (`eventos_ocorridos`):** Corrigido o bug onde eventos como revoltas eram rastreados em estado mutável no módulo `eventManager.js`. A chave `eventos_ocorridos` foi adicionada ao `GameState` (em `gameState.js`) para rastreamento 100% serializável.
*   **Lógica de Revolta (sem sobrescrita de alíquota):** A lógica de congelamento de arrecadação durante revolta foi corrigida no `simulationEngine.js`. Antes, o motor sobrescrevia a alíquota de imposto definida pelo jogador. Agora, a arrecadação é simplesmente zerada enquanto o estado de revolta persiste, sem alterar as configurações do pacto federativo.
*   **Equilíbrio Militar:** O custo de repressão de revoltas foi reduzido para valores sustentáveis (+3 milícia, custo único de 100 Contos de Réis) evitando espirais de falência.
*   **Save / Load / Auto-save:** Implementados botões de Salvar, Carregar e Reiniciar. O jogo faz auto-save silencioso a cada turno/ano avançado via `localStorage` (chave: `ucronia_brasilis_save`). Ao carregar, os sliders de repasse são sincronizados com os dados salvos.

### Implementações da Sessão 2 (Expansão das 12 Capitanias + Mapa Colonial):

*   **Arquivo de Dados Históricos (`data/capitanias_1534.js`):** Criado novo arquivo JavaScript com os dados calibrados das 12 entidades jogáveis baseadas nas 14 Capitanias Hereditárias históricas de 1534. Cada capitania inclui os campos `donatario` (nome histórico) e `regiao` (agrupamento geográfico: `norte`, `nordeste`, `leste`, `sudeste`).
*   **Refatoração Data-Driven (`gameState.js`):** O `GameState` agora importa os dados das capitanias do arquivo externo via `JSON.parse(JSON.stringify(...))` para garantir deep copy e serialização total. Os 3 estados hardcoded foram completamente removidos.
*   **Lógica Regional na Engine (`simulationEngine.js`):** O Ciclo do Açúcar agora aplica bônus apenas para capitanias com `regiao === "nordeste"` e `vocacao_agricola: true`. Capitanias do Norte com porto ≥ 2 ganham bônus de extração (+2%/ano).
*   **Mapa SVG Colonial (`index.html`):** O mapa placeholder de 3 polígonos geométricos foi substituído por um mapa artístico colonial com 12 regiões numeradas do Norte ao Sul, labels de nome em cada região, e um tooltip flutuante na base do painel.
*   **Filtro Regional (`view.js` + `styles.css`):** Painel de filtro com 5 botões (Todos / Norte / Nordeste / Leste / Sudeste). Ao clicar num filtro, os cartões das outras regiões colapsam com animação e as regiões não selecionadas ficam com opacidade reduzida no mapa SVG.
*   **Tooltip Interativo do Mapa:** Ao fazer hover em qualquer capitania no mapa, um tooltip exibe o nome, PIB atual e status de pacificação/revolta.
*   **Donatário nos Cartões:** Cada cartão exibe o nome histórico do donatário abaixo do título da capitania.

### Resultado do Teste de Estresse (50 anos: 1530–1580):
*   **✅ Engine estável com as 12 capitanias.**
*   Revoltas orgânicas ocorreram nos anos 1540 e 1574 (comportamento esperado).
*   **Observação de balanceamento:** Em cenários com repasse muito alto (65%+) e sem investimento em infraestrutura, os PIBs das capitanias menores decaem rapidamente. Isso é comportamento **correto e intencional** — cria a tensão econômica que é o núcleo do jogo.

### Implementações da Sessão 3 (Mapa D3.js, Balanço Econômico e Socorro de Lisboa/Londres — 17/06/2026):

*   **Integração com D3.js + GeoJSON:** Substituição do mapa estático por renderização vetorial dinâmica e interativa baseada em D3.js. Correção de projeção usando `d3.geoIdentity().reflectY(true).fitSize(...)` para impedir que os polígonos das capitanias/províncias colapsassem em um ponto. Estilização premium com transições, halos de texto e sombras realistas.
*   **Recalibração do Motor Econômico (`simulationEngine.js`):**
    *   **Milícia Local:** Custo reduzido de 10 para **4 Contos/ano** por nível de milícia, ajustando a despesa fixa inicial nacional de 120 para 48 contos (arrecadação inicial é de ~63 contos).
    *   **Crescimento PIB:** Crescimento base universal aumentado para **+2.0%/ano** (`0.020`) para dar fôlego ao crescimento natural do país.
    *   **Penalidade Fiscal:** Penalidade de imposto no crescimento do PIB colonial reduzida para o fator de `0.1` (em vez de 0.3), impedindo o colapso econômico e revolta imediata das capitanias silenciosas.
*   **Mecânica de Socorro Financeiro (Bailout):**
    *   **Socorro do Erário Régio (Era Colonial):** Injeta **+400 Contos** emergencialmente quando o tesouro estiver `< 50`. Consequências: +15% de revolta geral (presença de oficiais régios), aumento permanente de +5% na retenção fiscal para Lisboa, e amortização anual de -15 contos por 25 anos.
    *   **Empréstimo de Londres (Era Imperial):** Injeta **+600 Contos** de réis contraídos em Londres. Consequências: juros de -35 contos/ano por 20 anos e dreno de capital que reduz o crescimento do PIB de todas as províncias em -0.5% ao ano por 20 anos.
*   **UI Dinâmica de Empréstimos:** Novo botão `#btn-bailout` que se altera dinamicamente com cores e termos de acordo com a era, incluindo modais e toasts imersivos.

### Implementações da Sessão 5 (Sistema de Divergência Histórica e Linha Temporal — 17/06/2026):

*   **Algoritmo e Mecânica de Divergência (`simulationEngine.js`):**
    *   **Captura de Snapshots:** Implementada função `capturarSnapshot(state)` para coletar agregados nacionais (PIB, Tesouro, População, Média de Revolta, Média de Portos, Estradas e Milícias) a cada ano.
    *   **Fórmula Ponderada de 6 Dimensões:** Criada função `calcularDivergencia(...)` baseada nas diferenças relativas normalizadas entre o snapshot do jogador e a linha histórica real (PIB 25%, Tesouro 15%, População 10%, Estabilidade Social 15%, Infraestrutura Média 15%, Decisões Históricas 20%).
    *   **Interpolação de Dados:** Implementada interpolação linear dinâmica para permitir comparação precisa nos anos intermediários entre os snapshots canônicos de 5 em 5 anos.
*   **Geração da Linha do Tempo Canônica (`gerarHistoriaCanonica.js`):**
    *   Desenvolvido script de automação Node.js (`scripts/gerarHistoriaCanonica.js`) que simula a Era Colonial pura escolhendo as decisões canônicas dos eventos históricos reais (Salvador, Pernambuco, Palmares, Ouro, etc.), gerando os dados de base em `data/historia_canonica.js`.
*   **Camada Visual e Interface Gráfica (`view.js` + `index.html` + `styles.css`):**
    *   **Aba 🌎 Ucronia:** Criado painel completo na quarta aba do painel esquerdo.
    *   **Gauge de Divergência SVG:** Arco com gradiente suave (Verde-Amarelo-Vermelho) e agulha de exibição animada do índice total.
    *   **Gráfico de Trajetória D3.js:** Plotagem em tempo real da linha temporal do jogador comparada à linha real (0% de base), com bolinhas interativas nos anos das bifurcações contendo tooltips explicativos ao passar o mouse.
    *   **Diário de Decisões:** Tabela cronológica exibindo o status de cada escolha feita pelo jogador, demarcada com selo de decisão Real/Histórica (`✅`) ou Ucrônica (`⚡`).
    *   **Comparação Lado a Lado:** Tabela detalhada que compara dados atuais do jogador com os dados históricos reais do ano, exibindo deltas percentuais coloridos e setas inteligentes (adaptadas: revolta maior gera delta vermelho de atenção).
*   **Manutenção de Eras:** Divergência e snapshots agora são limpos ao reiniciar uma nova era no caminho canônico (0.0% inicial) ou mantidos e extrapolados no caminho ucrônico.

### Implementações da Sessão 6 (UX Round 2 e Ajustes de Servidor — 22/06/2026):

*   **Resolução Absoluta do Servidor (`scripts/server.js`):** Refatoramos o servidor de desenvolvimento para calcular dinamicamente o `PROJECT_ROOT` absoluto a partir da localização de seu arquivo. Isso corrigiu em definitivo o bug em que imagens de eventos e outros assets apresentavam erro de carregamento (404) dependendo do diretório a partir do qual o processo era iniciado.
*   **Modal de Confirmação para as Bandeiras:** Substituímos a ativação direta do botão por um modal estilizado semelhante aos eventos. Apresenta imagem contextualizada, descrição histórica, tabela comparativa de vantagens/desvantagens e opções de financiar imediatamente ou adiar.
*   **Alertas de Tempo Limite (1680) e Expiração (1690):** Criamos a lógica no motor (`advanceYear`) e na view (`updateInterface`) para:
    *   Exibir lembrete do conselheiro em 1680 sobre o fechamento da janela de exploração em 10 anos.
    *   Exibir notificação em 1690 de que a oportunidade expirou e desativar permanentemente o botão mudando seu rótulo para *"❌ Oportunidade Encerrada (Limite 1690)"*.
*   **Balanceamento de Exploração:** Aumentamos o ganho de investimento em exploração do financiamento único de 50 para **+100 de Exploração** de modo a atingir diretamente a condição necessária para disparar o Ciclo do Ouro colonial.
*   **Navegação e Scroll por Clique no Mapa:** Ajustamos o comportamento do clique do mapa D3 para que, além de ativar a aba de **Territórios**, execute um scroll suave até o card da capitania correspondente e aplique uma animação de brilho (`.card-highlight` pulsante) para melhor feedback visual.
*   **Menu de Abas Fixo (Sticky):** Modificamos a estrutura da coluna esquerda (`.col-left`) para fixar o menu superior de abas (`.tab-menu`), evitando que o jogador tenha que rolar o conteúdo das províncias de volta ao topo quando quiser interagir com o menu principal ou avançar de ano.
*   **Balão Informativo (Tooltips Educacionais):** Expandimos a cobertura do sistema de tooltips (`data-tooltip-game`) para explicar de forma lúdica o PIB regional, índice de revolta, status, upgrades individuais e estatísticas do governo central, tornando o jogo compreensível a jogadores casuais.

---

## 2. Mapeamento de Arquivos do Projeto

```
Ucronia Brasil/
├── assets/
│   └── img/
│       ├── bandeiras_modal.png          ← [NOVO] Imagem do modal das Bandeiras (gerada por IA)
│       └── eventos/                     ← Imagens dos eventos históricos (governo_geral.png, etc.)
├── data/
│   ├── capitanias_1534.js           ← Dados históricos das 12 capitanias (fonte da verdade)
│   ├── estados_1822.js              ← Dados históricos das 19 províncias imperiais
│   ├── eventos_colonial.js          ← [NOVO] Lista declarativa de eventos da Era Colonial
│   ├── historia_canonica.js         ← Snapshots canônicos da história real gerados pela engine
│   ├── mapas/
│   │   ├── capitanias_1534_geojson.js   ← GeoJSON das 12 capitanias (mapa D3 colonial)
│   │   └── estados_1822_geojson.js      ← GeoJSON das províncias imperiais
│   └── provincia_mapping.js         ← Mapeamento de redistribuição Colônia → Império
├── docs/
│   ├── GDD_Master.md                ← Documento de design e visão de escopo
│   └── DEV_LOG.md                   ← Este arquivo
├── scripts/
│   ├── server.js                    ← Servidor web local HTTP estático (caminhos absolutos)
│   ├── testSimulation.js            ← Teste de estresse (50 anos via Node.js)
│   ├── testTransition.js            ← Teste de transição de eras (Colônia -> Império)
│   ├── testBailout.js               ← Teste das mecânicas de Socorro Régio e Empréstimos
│   └── gerarHistoriaCanonica.js     ← Script que roda simulação canônica e gera historia_canonica.js
├── src/
│   ├── eventManager.js              ← Gerenciador de eventos (registra decisões de bifurcação)
│   ├── gameState.js                 ← Estado global inicial (variáveis de ucronia)
│   ├── simulationEngine.js          ← Motor puro (cálculo de divergência, bandeiras, snapshots)
│   ├── styles.css                   ← Estilos dinâmicos (aba Ucronia, sticky menu, tooltips)
│   └── view.js                      ← Controladora da UI (~1862 linhas — renderiza tudo)
└── index.html                       ← Estrutura HTML (~700 linhas — modais, abas, SVG D3)
```

### Funções detalhadas por arquivo:

*   **[data/capitanias_1534.js](file:///c:/Users/rscon/Projeto%20Brasil/data/capitanias_1534.js):** Exporta `capitaniasIniciais` — array com as 12 capitanias hereditárias e seus dados demográficos, econômicos, de infraestrutura e defesa calibrados para 1530. Inclui os campos extras `donatario` e `regiao`.
*   **[index.html](file:///c:/Users/rscon/Projeto%20Brasil/index.html):** Estrutura do dashboard. Coluna esquerda com painel de filtro regional e cartões dinâmicos. Coluna direita com mapa SVG colonial estilizado (12 regiões, viewBox 0 0 460 720) e tooltip flutuante.
*   **[src/gameState.js](file:///c:/Users/rscon/Projeto%20Brasil/src/gameState.js):** Inicializa o `GameState` em 1530. Importa `capitaniasIniciais` e popula o array `estados` com deep copy. Inclui chaves `eventos_ocorridos`, `historico_alertas` e `config_ui`.
*   **[src/simulationEngine.js](file:///c:/Users/rscon/Projeto%20Brasil/src/simulationEngine.js):** Motor matemático puro. Processa `advanceYear()`, `executeUpgrade()`, `financiarBandeiras()` e `aumentarDefesa()`. Implementa Ciclo do Pau-Brasil (até 1550), Ciclo do Açúcar (Nordeste agrícola), Ciclo do Ouro (São Vicente/Sudeste) e Ciclo de Extração do Norte.
*   **[src/eventManager.js](file:///c:/Users/rscon/Projeto%20Brasil/src/eventManager.js):** Avalia triggers de eventos contra o estado atual. Rastreia eventos via `GameState.globais.eventos_ocorridos`. Implementa o evento de Revolta Colonial e a mecânica de Restauração da Ordem.
*   **[src/view.js](file:///c:/Users/rscon/Projeto%20Brasil/src/view.js):** Controladora completa da UI. Cria cartões dinamicamente com `data-regiao`, gerencia filtros regionais, tooltip do mapa, persistência (save/load/reset com `localStorage`), modal de conselho e sistema de toast.
*   **[src/styles.css](file:///c:/Users/rscon/Projeto%20Brasil/src/styles.css):** Variáveis CSS por era. Estilos do mapa colonial (`.map-label`, `.state-path`), filtro regional (`#filtro-regioes`, `.card.filtrado-oculto`) e tooltip (`#mapa-tooltip`). Atualizado com os estilos da aba Ucronia.
*   **[scripts/testSimulation.js](file:///c:/Users/rscon/Projeto%20Brasil/scripts/testSimulation.js):** Script de estresse executado via `node scripts/testSimulation.js`. Simula 50 anos com políticas centralizadora (1530–1549) e descentralizadora (1550–1580) e exibe tabela anual de todas as 12 capitanias.
*   **[data/historia_canonica.js](file:///c:/Users/rscon/Projeto%20Brasil/data/historia_canonica.js):** Exporta `historiaCanonica` contendo o banco de dados de referência (snapshots de 5 em 5 anos e decisões canônicas esperadas para cada era).
*   **[scripts/gerarHistoriaCanonica.js](file:///c:/Users/rscon/Projeto%20Brasil/scripts/gerarHistoriaCanonica.js):** Script Node.js que simula o caminho canônico do jogo escolhendo decisões históricas exatas e gera historia_canonica.js automaticamente.

---

## 3. As 12 Capitanias Jogáveis (Estado em 1530)

| ID | Nome | Donatário | Região | PIB Inicial | Porto | Revolta Inicial |
|---|---|---|---|---|---|---|
| `maranhao` | Capitania do Maranhão | João de Barros & Aires da Cunha | Norte | 30 | 1 | 15% |
| `ceara` | Capitania do Ceará | António Cardoso de Barros | Norte | 20 | 1 | 20% |
| `rio_grande` | Capitania do Rio Grande | João de Barros & Aires da Cunha | Nordeste | 25 | 1 | 20% |
| `itamaraca` | Capitania de Itamaracá | Pero Lopes de Sousa | Nordeste | 45 | 2 | 15% |
| `pernambuco` | Capitania de Pernambuco | Duarte Coelho | Nordeste | 120 | 3 | 10% |
| `bahia` | Capitania da Baía de Todos os Santos | Francisco Pereira Coutinho | Nordeste | 90 | 4 | 20% |
| `ilheos` | Capitania de Ilhéus | Jorge de Figueiredo Correia | Leste | 40 | 2 | 25% |
| `porto_seguro` | Capitania de Porto Seguro | Pero do Campo Tourinho | Leste | 35 | 2 | 20% |
| `espirito_santo` | Capitania do Espírito Santo | Vasco Fernandes Coutinho | Leste | 30 | 2 | 15% |
| `sao_tome` | Capitania de São Tomé | Pero de Góis da Silveira | Sudeste | 25 | 1 | 20% |
| `sao_vicente` | Capitania de São Vicente | Martim Afonso de Sousa | Sudeste | 60 | 2 | 5% |
| `santo_amaro` | Capitania de Santo Amaro e Santana | Pero Lopes de Sousa | Sudeste | 20 | 1 | 15% |

---

## 4. Pautas em Aberto & Próximos Passos

### Alinhamento de Design de Eras (Sessão 15/06/2026):
*   **Divisão em 5 Eras:** Decidido expandir o jogo para 5 eras consecutivas: Brasil Colônia (1530-1822), Brasil Império (1822-1889), Brasil República (1889-1988), Brasil Contemporâneo (1988-2026) e Brasil Futuro/Ficção (2026+).
*   **Mecânica de Transição (Ucrônica vs Canônica):** O jogador escolhe manter o estado ucrônico (PIBs e tesouros mapeados e redistribuídos para a próxima era) ou reiniciar na história real com os dados canônicos do período.
*   **Leaderboards por Era:** Cada era finalizada salva a pontuação em um ranking local isolado (no localStorage).

### Implementado na Sessão de Hoje (Fase 2.5 & 3: Transição de Eras, Eventos Avançados e Polimento Visual):
*   **Mapeamento Territorial:** Desenvolvido `data/provincia_mapping.js` para redistribuir dados econômicos/demográficos das 12 capitanias nas 19 províncias imperiais.
*   **Dados de 1822:** Criado `data/estados_1822.js` com a fotografia econômica canônica real da fundação do Império.
*   **Engine Multi-Era:** Refatorado `simulationEngine.js` para barrar turnos em `fim_da_era` e pausar em 1822. Inserida mecânica imperial de café e ferrovias.
*   **Interface de Escolha:** Criado modal premium de transição em `index.html`, regras visuais em `src/styles.css` e controles de carregamento (ucrônico vs. canônico) em `src/view.js`.
*   **Rankings Locais:** Integrada persistência de leaderboard para eras individuais no localStorage (`ucronia_brasilis_rankings`).
*   **Scripts de Testes:** Criado `scripts/testTransition.js` validando de ponta a ponta as transições da engine.
*   **Expansão de Eventos Históricos:** Implementação de 4 novos eventos complexos: Invasão de Salvador (1624), Quilombo de Palmares (1670), Ciclo do Ouro (1693) e Inconfidência Mineira (1789).
*   **Polimento Visual da Era Colonial:**
    *   *Estilo de época:* Aplicada uma paleta de pergaminho antigo envelhecido baseada em gradiente radial (`radial-gradient`), tons terrosos, madeira de jacarandá e textos em sépia.
    *   *Hover Interativo:* Cartões de capitania ganharam micro-animações de elevação no hover.
    *   *Banners de IA nos Modais:* Geração de 6 pinturas clássicas a óleo históricas correspondentes a cada evento e exibição Edge-to-Edge no topo dos modais.
*   **Correção de Bug Crítico de Layout:** Isolamento do layout flex das colunas usando o wrapper `.app-container` e elevação de todos os modais fixed para a raiz de `<body>`. Isso resolveu em definitivo o bug em que o modal ficava espremido no canto esquerdo e os cliques eram invalidados.
*   **Automação Prática:** Inserção do parâmetro `?reset=true` no carregamento da view para contornar bloqueios de `confirm` em rotinas de testes no navegador.

### Implementações da Sessão 4 (Zoom do Mapa, Dashboard em Abas e Seletor de Temas — 17/06/2026):

*   **Navegação no Mapa com D3 Zoom:**
    *   Habilitado zoom por scroll de mouse e pan por arrasto com escala delimitada de $1\times$ a $8\times$.
    *   Adicionados botões flutuantes e dinâmicos de controle de zoom (`+`, `-`, `🔄`) no canto superior direito do mapa.
    *   Persistência do estado do zoom e pan ao mudar de era ou avançar de turnos (envelopamento das camadas do mapa no grupo `#map-zoom-group`).
*   **Ícones e Elementos Vetoriais no Mapa:**
    *   **Portos:** Representados por âncoras (`⚓`) que aumentam de escala conforme o nível de infraestrutura local do porto.
    *   **Capitais/Vilas:** Adição de ícones `⭐` na coordenada da capital para fácil identificação da sede administrativa.
    *   **Bases de Defesa:** Exibição de escudos (`🛡️`) em capitais com nível de milícia $\ge 2$.
    *   **Offset de Coordenadas:** Desenvolvida função de offset horizontal para separar e tornar visíveis os ícones de porto e capital que dividem a mesma coordenada geográfica exata.
    *   **Ferrovias:** Conexões imperiais e modernas com nível de desenvolvimento de tráfego/estrada $\ge 2$ agora são desenhadas em formato de trilhos (duas linhas sobrepostas com padrão tracejado).
*   **Legenda do Mapa Dinâmica:**
    *   Implementado painel flutuante de legenda no canto inferior direito que se altera e ajusta sua nomenclatura e símbolos conforme a era ativa.
    *   Menu superior de abas (`🏛️ Governo`, `🗺️ Territórios`, `📊 Economia`) com efeito de animação fade-in na alternância.
    *   Criação da aba de **Economia** com os agregados nacionais (PIB total, média de descontentamento) e tabela detalhada de províncias/capitanias.
*   **Layout de Temas de Interface (Tema Moderno vs. Imersivo):**
    *   Introduzido dropdown para escolha de estilo visual persistente na chave `config_ui.estilo_layout`.
    *   **Tema Moderno (Escuro):** Interface escuro premium em tons de azul slate profundo e realce ciano/azul com fontes sans-serif uniformizadas (`Inter`).
    *   **Melhoria do Tema Colonial:** Suavização dos tons de pergaminho antigo e migração dos textos/botões de dados normais de `Playfair Display` para `Inter` para maior facilidade de leitura (atendendo à queixa de fontes muito grandes).

---

## 5. Sessão 7 (22/06/2026) — Fases 3.0 e 3.1: Realismo, Enciclopédia e Interfaces (CONCLUÍDAS)

### Contexto da Sessão
Nesta sessão de desenvolvimento, integramos com sucesso as especificações de realismo de jogabilidade (Fase 3.0) e melhorias avançadas na interface do mapa e do painel esquerdo (Fase 3.1).

### Implementações Realizadas:
*   **Territórios Inacessíveis:**
    *   Campos `status_territorio`, `invadido_por` e `duracao_invasao` mapeados nas capitanias de `data/capitanias_1534.js` e em `data/estados_1822.js` para garantir retrocompatibilidade.
    *   Lógica pura inserida em `simulationEngine.js`: se o descontentamento bate `100%`, o território torna-se `"rebelado"` (travando alíquota e upgrades). A capitulação perante a invasão holandesa de 1630 agora altera o status para `"invadido"` por 20 anos.
    *   Lógica de retomada: criadas as funções puras de ação `atacarTerritorio()` (custo de 250 Contos para retomada imediata) e `negociarTerritorio()` (penalidade de arrecadação por 10 anos).
    *   Estilos visuais integrados no D3 (`view.js`): rebelados em vermelho escuro (`#7b0000`) e invadidos em azul escuro (`#1a3a6b`).
*   **Cidades Históricas e Estradas no Mapa D3:**
    *   Criado o arquivo declarativo [data/cidades_historicas.js](file:///c:/Users/rscon/Projeto%20Brasil/data/cidades_historicas.js) mapeando os nós urbanos (incluindo as capitais clássicas e novos assentamentos como São Paulo 1554, Natal 1599 e Porto Alegre 1772) e suas conexões de rotas e trilhas terrestres/marítimas.
    *   Renderização D3 de cidades feita usando ícones vetoriais de casinhas coloniais de tamanho discreto (`5px`), acompanhadas de suas legendas de texto (`6.5px`) para não eclipsar a primazia visual das capitais (estrelas douradas `⭐` de `11px`).
    *   Desenho de caminhos de conexão dinâmicos (`#mapa-estradas` usando caminhos tracejados de D3) surgindo no mapa conforme o ano da simulação atinge o ano de fundação de ambas as cidades da rota.
*   **Biblioteca Histórica:**
    *   Novo arquivo [data/enciclopedia.js](file:///c:/Users/rscon/Projeto%20Brasil/data/enciclopedia.js) contendo biografias de personalidades, marcos na linha do tempo, curiosidades de províncias e dados sobre os ciclos de açúcar, pau-brasil, ouro e café.
    *   Painel acionável de abas colapsáveis e campo de busca instantânea integrado à spa via `renderBiblioteca()` em `view.js`.
*   **Modais Estilizados de Confirmação:**
    *   Inserção de overlays e modais para confirmação de "Reiniciar Jogo" e "Limpar Histórico" com efeitos visuais de blur de fundo e mensagens de impacto, extinguindo os confirms padrões do navegador. O botão limpar agora zera adequadamente saves e recordes.
*   **Fechamento Colonial e Estabilidade Ucronia:**
    *   Evitada a destruição do DOM na aba Ucronia quando o jogador avança de era (antes, o erro de dados não calibrados para o Império quebrava a estrutura interna HTML da aba). Agora, a aba Ucronia simplesmente alterna a visibilidade dos cards e exibe o **Consolidado Final do Período Colonial (1530-1822)** comparando os resultados finais obtidos na colônia.

---

## 6. Sessão 8 (22/06/2026) — Ajustes Finais da Era Colonial e Aprovação da Fase 4.0 (CONCLUÍDAS)

### Contexto da Sessão
Ajustes de sincronização lógica e persistência de dados na Era Colonial antes do início do desenvolvimento da Era do Império (Fase 4.0).

### Implementações Realizadas:
*   **Correção de Divergência Histórica (Ucronia vs. Real):**
    *   Corrigido o bug de divergência nos primeiros eventos (`Fundação de São Paulo 1554`, `Confederação dos Tamoios 1556` e `União Ibérica 1580`), onde as escolhas históricas estavam marcadas como "Ucrônicas" por falta de sincronia nas chaves canônicas de `scripts/gerarHistoriaCanonica.js`.
    *   Regerada a base histórica canônica (`data/historia_canonica.js`) rodando o script automatizado.
*   **Persistência do Socorro Régio:**
    *   Ajustada a ação do botão `#btn-bailout` (Socorro Régio de Lisboa) para invocar `salvarJogo()` imediatamente após a concessão dos fundos e amortização da dívida, evitando perda de estado econômico no recarregamento.
*   **Imagens de Eventos Faltantes:**
    *   Geradas imagens artísticas de pintura a óleo usando IA para os eventos coloniais recém-criados: `fundacao_sp.png`, `guerra_tamoios.png` e `uniao_iberica.png` em `assets/img/eventos/`.
*   **Validação da Limpeza de Histórico:**
    *   Verificada a correta deleção das variáveis locais no `localStorage` ao clicar em "Limpar Histórico" e reiniciar a simulação do zero.

---

## 7. Próxima Etapa: Fase 4.0 — A Era do Império (1822–1889)

### Objetivos do Próximo Sprint
1.  **Transição de Províncias:** Mapeamento e conversão de 12 capitanias coloniais para as 20 províncias imperiais do arquivo `data/estados_1822.js` usando matriz de pesos em `data/provincia_mapping.js`.
2.  **Ciclo do Café & Ferrovias:** Ativação de crescimento econômico acelerado (+12% ao ano) no Sudeste e desenho de linhas de ferrovia no mapa D3 para conexões com infraestrutura $\ge 2$.
3.  **Poder Moderador:** Introdução de comandos autoritários (Decretar Impostos e Dissolver Assembleia) com ganhos financeiros expressivos, mas alto custo social de revolta.
4.  **Revoltas Regenciais e Guerra do Paraguai:** Integração de eventos da Cabanagem, Farroupilha, Sabinada, Balaiada, Guerra do Paraguai e a abolição da escravidão em 1888.
5.  **Calibração de Divergência Imperial:** Gravação de snapshots imperiais em `historia_canonica.js` para estender o arco de ucronia comparativa.


