# GDD MASTER: Ucronia Brasilis (Nome Provisório)
## Documento de Alinhamento Arquitetural e Visão de Escopo

Este documento serve como a "Fonte da Verdade" e contexto principal para os agentes de IA que atuam no desenvolvimento do projeto. Ele estabelece a filosofia de design, as regras de negócio de alto nível e as diretrizes de arquitetura para garantir que o sistema permaneça modular, expansível e de fácil manutenção.

---

## 1. Visão Geral do Jogo

**Ucronia Brasilis** é um simulador web (rodando direto no navegador) focado em estratégia, economia, política e militarismo da história do Brasil, cobrindo o período desde as Capitanias Hereditárias (1530) até a Era Contemporânea e Projeções Futuras.

O cerne do jogo é o conceito de **Ucronia (História Alternativa)**: dar ao jogador ferramentas políticas e econômicas para alterar o rumo da história real, lidando com as consequências sistêmicas de suas decisões (ex: tensões regionais, mudanças logísticas, crises e revoltas).

### Pilares de Design:
*   **Foco Textual e Numérico:** Interface limpa baseada em dados, tabelas, infográficos dinâmicos e mapas vetoriais (SVG). Sem gráficos pesados ou 3D.
*   **Adaptação ao Jogador:** Mecânicas parametrizáveis que atendem tanto o jogador casual (macro-diretrizes) quanto o hardcore (microgerenciamento de alíquotas e recursos).
*   **A Força da Ideologia:** O jogo usa tensões e visões políticas/econômicas reais como motor de engajamento — centralização vs. descentralização, industrialização vs. agroexportação, autonomia regional vs. poder da Coroa.
*   **Data-Driven Estrito:** Todo dado de configuração (capitanias, eventos, cenários) vive em arquivos de dados separados. A engine e a view são agnósticas ao número de entidades.

---

## 2. Premissas da Arquitetura de Software

Para evitar que novas atualizações ou cenários quebrem o núcleo do jogo, o desenvolvimento deve seguir estritamente o padrão **Data-Driven (Guiado por Dados)** e o **Desacoplamento Total (Clean Architecture)**.

### Divisão de Camadas:
1.  **Data (Dados de Configuração):** Arquivos em `data/` contendo entidades e eventos como objetos JS exportados. Nenhuma lógica de negócio aqui — apenas estruturas de dados.
2.  **State (O Estado Global):** Um objeto JSON contendo o "retrato" exato do jogo naquele ano/ciclo. Deve ser **100% serializável** (fácil de salvar, carregar e enviar para um servidor). Nunca deve conter funções ou referências circulares.
3.  **Engine (O Motor de Regras):** Funções matemáticas **puras** em `src/simulationEngine.js`. Recebem o estado atual, processam as alterações do turno e retornam um **novo estado** atualizado. A Engine não guarda dados internos.
4.  **EventManager (Gerenciador de Eventos):** Leitor de triggers em `src/eventManager.js` que avalia condições contra o Estado e injeta consequências. Rastreia eventos disparados via `GameState.globais.eventos_ocorridos` (nunca em estado interno do módulo).
5.  **View (A Interface):** Camada visual em `src/view.js` + `src/styles.css` + `index.html`. Apenas lê o Estado e renderiza os elementos — não calcula regras de negócio.

### Fluxo de Dados (Unidirecional):
```
[Decisão do Jogador / UI]
        ↓
[view.js: applyPlayerDecisions() → atualiza currentState]
        ↓
[simulationEngine.js: advanceYear(state) → retorna newState]
        ↓
[eventManager.js: checkEvents(state, events) → retorna newState]
        ↓
[view.js: updateInterface(state) → renderiza DOM + SVG]
        ↓
[localStorage: auto-save silencioso]
```

---

## 3. Estrutura do Modelo de Dados (O Esquema do Estado)

O `GameState` é dividido em duas esferas. Toda capitania segue o mesmo schema:

### Variáveis Globais (`globais`):
*   `ano_atual`: Inteiro. O ano em curso na simulação.
*   `tesouro_nacional`: Float. Contos de Réis disponíveis para a Coroa/União.
*   `inflacao`: Float. Taxa base de inflação anual (dormida até Eras futuras).
*   `investimento_exploracao`: Float. Acumulador de investimentos em Bandeiras para o Ciclo do Ouro.
*   `alertas_conselho`: Array de strings. Alertas a serem exibidos no turno atual (limpos após exibição).
*   `historico_alertas`: Array de strings. Memória de alertas já exibidos (evita spam).
*   `eventos_ocorridos`: Objeto `{ [evento_id]: true }`. Rastreia eventos que já dispararam (persistência de eventos).
*   `config_ui`: `{ exibir_popup_conselho: boolean }`. Preferência do jogador sobre notificações.
*   `penalidades_ativas`: Array de objetos `{ id, nome, tipo, valor, duracao_anos }`. Rastreia passivos temporários. Permite amortizações diretas de tesouro (`tipo === "tesouro"`) ou multiplicadores de decréscimo de PIB nacional (`tipo === "pib_global_penalidade"`).
*   `historico_jogador`: Array de objetos snapshot. Contém o histórico de métricas agregadas anuais do jogador para plotagem.
*   `decisoes_historicas`: Array de objetos de decisões de bifurcações tomadas `{ evento_id, opcao_escolhida, ano, nome_evento, nome_opcao }`.
*   `divergencia_atual`: Float (0-100%). Porcentagem atual de afastamento da linha do tempo real.

### Variáveis por Entidade Regional (`estados[]`):
*   **Identificação:** `id` (snake_case único), `nome` (string exibível), `donatario` (informativo), `regiao` (enum: `"norte"`, `"nordeste"`, `"leste"`, `"sudeste"`).
*   **Demografia:** `populacao_total`, `nivel_satisfacao` (0–100, reservado para Eras futuras).
*   **Economia Local:** `pib_total`, `arrecadacao_bruta` (calculado pela engine no ciclo), `vocacao_agricola` (boolean — habilita Ciclo do Açúcar).
*   **O Pacto Federativo:** `aliquota_imposto` (% do PIB cobrado), `retencao_uniao` (% da arrecadação que vai para o Tesouro Nacional), `repasse_estado` (% devolvido para a capitania).
*   **Infraestrutura (Níveis 0–10):** `modal_portuario`, `modal_rodoviario`. Novos modais (ferroviário, aéreo) serão desbloqueados automaticamente em Eras futuras.
*   **Defesa e Controle Social:** `milicia_local` (nível), `indice_revolta` (0–100%).

> **Nota:** Os campos `nivel_satisfacao` e `inflacao` existem no schema mas ainda não têm mecânicas ativas. São reservados para as Eras do Império e Moderna, onde as dinâmicas de satisfação popular e inflação se tornam relevantes (ex: Abolição da Escravatura, Proclamação da República, hiperinflação).

---

## 4. Os Ciclos Econômicos Históricos

A engine implementa progressão histórica via ciclos que se ativam por ano e condições:

| Ciclo | Período | Condição | Efeito |
|---|---|---|---|
| **Pau-Brasil** | Até 1550 | Sempre | Bônus proporcional ao porto (×0.03) e estradas (×0.01) |
| **Açúcar** | 1550+ | `regiao === "nordeste"` + `vocacao_agricola` | Porto ≥ 3 → +5%/ano; Porto < 3 → Alerta de gargalo |
| **Extração Norte** | 1550+ | `regiao === "norte"` + porto ≥ 2 | +2%/ano (drogas do sertão, madeira) |
| **Ouro** | Dinâmico | `sao_vicente` + exploração ≥ 500 + estradas ≥ 3 | +15%/ano de crescimento acelerado |

## 5. Estrutura de Eras e Transição de Era

Para evitar escopo inflado e permitir um desenvolvimento modular focado por etapas, o jogo é estruturado em **5 Eras Históricas e Ucrônicas**. Cada era possui seu próprio conjunto de entidades regionais, regras de negócio ativas, modais de infraestrutura e ranking final de pontuação.

### Tabela de Eras:
| Era | Período | Entidades | Foco Principal / Mecânicas Ativas |
|---|---|---|---|
| **Brasil Colônia** | 1530 – 1822 | 12 Capitanias Hereditárias | Ciclos básicos (Pau-Brasil, Açúcar, Ouro, Drogas do Sertão), Bandeiras, revoltas de colonos, pirataria. |
| **Brasil Império** | 1822 – 1889 | 20 Províncias Imperiais | Ciclo do Café, ferrovia, abolição da escravidão, satisfação popular ativa, Poder Moderador, revoltas regenciais. |
| **Brasil República** | 1889 – 1988 | 20 Estados Federais | Industrialização acelerada, urbanização, rodovias modernas, inflação ativa, instabilidade política (Era Vargas/Ditadura). |
| **Brasil Contemporâneo** | 1988 – 2026 | 27 Unidades Federativas | Estabilização monetária, commodities modernas (soja, petróleo), welfare state, modal aéreo, metas de juros e inflação. |
| **Brasil Futuro (Ficção)** | 2026 – 2076+ | 27 Unidades / Blocos | Transição energética (hidrogênio verde), automação/IA, crédito de carbono, exploração espacial (Alcântara), sandbox eterno. |

---

### Mecânica de Transição de Era (Ano de Virada)
Ao atingir o ano limite de uma era (ex: 1822 para Colônia, 1889 para Império), a simulação é pausada e um **Evento de Transição de Era** é disparado. O jogador recebe uma tela de fechamento de era exibindo seus resultados e é apresentado a uma escolha crucial:

1. **Caminho Ucrônico (Ucronia / História Alternativa):**
   * O jogador avança para a próxima era **carregando a economia, história e status do seu jogo atual**.
   * O motor realiza uma **extrapolação geográfica e financeira**: o PIB final, a população e o tesouro da era anterior são redistribuídos/mapeados para as novas províncias/estados correspondentes (ex: as capitanias do sudeste determinam o PIB inicial das províncias de São Paulo, Rio de Janeiro e Minas Gerais).
   * Melhoras de infraestrutura e defesas construídas geram bônus iniciais permanentes na era seguinte.
2. **Caminho Canônico (Reinício Histórico):**
   * O jogador avança para a próxima era **começando do zero com a história real**.
   * O jogo inicializa o estado usando o arquivo de dados padrão da nova era (ex: `data/estados_1822.js` para o Império), contendo os PIBs, divisões territoriais, dívidas e alíquotas históricas reais.

---

### Rankings Locais e Globais de Eras
Cada era encerrada gera uma pontuação final para o jogador, calculada com base em:
* PIB Nacional acumulado.
* Tesouro acumulado.
* Média de satisfação popular (quando ativa).
* Nível de infraestrutura nacional.
* Nível de estabilidade social (ausência de revoltas).

Essa pontuação é registrada em um **Leaderboard local específico daquela era**. Isso garante que jogadores possam competir nos rankings de eras individuais (ex: "Ranking do Brasil Colônia") sem misturar o balanceamento de diferentes períodos históricos.

---

## 6. Mecânicas de Eventos

Eventos são disparados pelo `eventManager.js` com base em gatilhos no Estado.

### Eventos Genéricos/Sistêmicos:
*   **Revolta Colonial:** Gatilho: `indice_revolta >= 70` em qualquer capitania. Efeito: Congela a arrecadação da capitania (sem alterar a alíquota configurada). Notifica o Conselho.
*   **Restauração da Ordem:** Gatilho: Capitania em revolta + `milicia_local >= 3`. Efeito: Reduz o `indice_revolta` em 25 pontos. Notifica o Conselho.

### Eventos Históricos & Bifurcações Estratégicas (Era Colonial):
*   **Governo-Geral (1548):** Centralizar o poder sob Salvador (bônus de arrecadação e custo de tesouro) ou resistir (maior alíquota forçada e revolta geral).
*   **França Antártica (1555):** Retomada militar (custo de tesouro, reduz revolta em São Tomé e eleva defesa) ou negociar (perda de fundos anuais devido ao contrabando).
*   **Invasão Holandesa de Pernambuco (1630) / Salvador (1624):** Resistência armada (custos militares de tesouro, danos ao PIB local por anos, mas aumento de milícia/defesa) ou capitulação/recuo (perdas no Tesouro e bloqueio ao PIB).
*   **Resistência de Palmares (1670):** Contratar campanha de destruição militar (esmagamento da revolta pernambucana e ganho de defesa) ou tratado de autonomia com Ganga Zumba (perda de caixa por multa da Coroa, com queda de revolta).
*   **Ciclo do Ouro nas Minas Gerais (1693):** Decretar cobrança do Quinto (bônus de arrecadação global e alta revolta em São Vicente) ou decretar Mineração Livre (grande bônus de PIB local e taxa única).
*   **Inconfidência Mineira (1789):** Repressão severa com execução (queda de revolta local, com perda de PIB regional por clima de terror) ou perdoar e suspender a derrama (perda de caixa e redução de alíquotas).

---

## 7. Sistema de Persistência (Save/Load)

*   **Modo Atual (Sandbox Local):** O `GameState` completo é serializado via `JSON.stringify()` e armazenado no `localStorage` do navegador sob a chave `ucronia_brasilis_save`. Auto-save ocorre a cada turno avançado.
*   **Compatibilidade Online (Futura):** Por ser um objeto JSON puro e 100% serializável, o mesmo estado pode ser enviado a um servidor via `POST` sem nenhuma alteração estrutural. O backend apenas armazena e devolve o JSON.

---

## 8. Temas Visuais Dinâmicos e Layout da Interface

O painel suporta alternância de temas e recursos interativos avançados no mapa e no dashboard:

### 8.1 Estilo de Interface (Seletor de Tema)
O jogador pode selecionar o estilo visual nas opções da UI, o qual é persistido no estado de jogo (`config_ui.estilo_layout`):
*   **Imersivo (Histórico):** O visual se adapta a cada era usando o atributo `data-era` no `<body>` para alternar variáveis de cores e fontes CSS:
    *   `"colonial"`: Pergaminho antigo e quente, tons terrosos, radial gradient, e fontes de título serifadas (`Playfair Display`). Corpo do painel e dados usam `Inter` (sans-serif) para facilitar a leitura.
    *   `"imperio"`: Verde-imperial profundo, detalhes em dourado e fonte elegante (`Cinzel`).
    *   `"republica"`: Tons de azul e cinza institucional com fonte sans-serif (`Inter`).
    *   `"contemporanea"`: Visual roxo/azul-petróleo tecnológico moderno.
    *   `"futura"`: Dark mode cibernético com realce em verde neon limão.
*   **Moderno (Escuro):** Força um layout escuro premium unificado (`data-theme="moderno"`) em tons de azul ardósia escuro, fontes limpas e uniformes (`Inter`), e realces ciano/azul para todos os turnos, independentemente da era atual.

### 8.2 Organização em Abas (Dashboard)
A coluna esquerda do painel é dividida em **cinco abas funcionais** para melhorar o espaço em tela:
1.  **🏛️ Governo:** Apresenta dados globais, barra de progresso da era, botões de ação e rankings de recordes locais.
2.  **🗺️ Territórios:** Exibe filtros de região e os cartões de cada província/capitania para upgrades locais e pacto fiscal. Territórios inacessíveis (invadidos ou em revolta total) exibem somente opções de Atacar/Negociar.
3.  **📊 Economia:** Um painel financeiro detalhado com agregados nacionais e uma tabela com dados agregados de PIB, imposto, revolta e status de estabilidade regional.
4.  **🌎 Ucronia:** Painel de Divergência Histórica que compara o progresso do jogador com o gabarito real em tempo real.
5.  **📚 Biblioteca:** _(Fase 3.0)_ Enciclopédia histórica in-game com linha do tempo interativa, ciclos econômicos, personalidades históricas e dados reais de cada capitania/província.

O menu de abas (`.tab-menu`) é **fixo (sticky)** no topo do painel esquerdo, assegurando que o jogador não precise rolar de volta ao topo para mudar de aba ou passar o ano enquanto estiver visualizando dados longos nas abas inferiores. Apenas a área de conteúdo (`.tab-content-wrapper`) rola verticalmente.

### 8.3 Navegação e Marcadores do Mapa D3
*   **Zoom Dinâmico:** Habilitado com escala de zoom entre $1\times$ a $8\times$, suportando arrasto, scroll de mouse e botões programáticos (`+`, `-`, `🔄`).
*   **Atalho de Clique Regional:** Clicar em qualquer território/capitania no mapa D3 redireciona automaticamente o jogador para a aba de **Territórios**, realiza um scroll suave (`scrollIntoView`) até o cartão correspondente e o realça temporariamente com uma animação pulsante de borda (`.card-highlight`) por 2 segundos.
*   **Marcadores Vetoriais:** 
    *   *Portos:* Representados por âncoras (`⚓`) que aumentam de escala conforme o nível de infraestrutura.
    *   *Capitais/Sede:* Marcadores de estrela dourada (`⭐`) nas coordenadas principais.
    *   *Offset Automático:* Caso capitais e portos dividam a mesma coordenada, a UI aplica automaticamente um desvio horizontal de pixels para evitar sobreposição.
    *   *Bases de Defesa:* Escudos (`🛡️`) exibidos próximos a capitais que possuem nível de milícia $\ge 2$.
    *   *Ferrovias:* Conexões de tráfego que atingem nível $\ge 2$ na Era do Império (ou superior) ganham um traçado característico em trilhos ferroviários (linha escura com tracejado branco).
*   **Legenda do Mapa:** Painel flutuante de legenda que altera seus símbolos e terminologia histórica de forma dinâmica de acordo com a era jogada.

### 8.4 Sistema de Tooltips Educacionais
O jogo emprega um sistema de tooltips globais (`data-tooltip-game`) visando à acessibilidade e contextualização histórica. Ao passar o mouse sobre variáveis numéricas (PIB, revolta, alíquotas), upgrades regionais (porto, estradas, defesa), botões de decisão (Bandeiras, Bailouts, Avançar) ou menus do painel, um balão flutuante explica de forma lúdica a mecânica de jogo correspondente e os impactos estratégicos das escolhas (ex: como a milícia afeta a revolta, ou o trade-off fiscal do repasse estadual).


----

## 9. Roadmap de Fases de Desenvolvimento

*   **✅ Fase 1: Fundações (CONCLUÍDA)**
    *   Arquitetura 4 camadas (Data/State/Engine/View)
    *   Interface temática com transição automática de eras
    *   Sistema de investimentos (upgrades de infraestrutura e defesa)
    *   Ciclos econômicos dinâmicos (Pau-Brasil, Açúcar, Ouro)
    *   Sistema de conselheiros, toast e modal de alertas
    *   Sistema de eventos (Revolta + Restauração da Ordem)
    *   Save/Load local via localStorage

*   **✅ Fase 1.5: Expansão Colonial (CONCLUÍDA em 15/06/2026)**
    *   Expansão de 3 para **12 Capitanias Hereditárias** com dados históricos
    *   Arquivo de dados externo (`data/capitanias_1534.js`) — padrão data-driven completo
    *   Mapa SVG colonial estilizado com 12 regiões identificadas
    *   Filtro regional interativo (Norte / Nordeste / Leste / Sudeste)
    *   Tooltip interativo no mapa (hover exibe dados da capitania)
    *   Lógica regional na engine (Ciclo do Açúcar restrito ao Nordeste)

*   **✅ Fase 2: Conteúdo Colonial Avançado (CONCLUÍDA em 16/06/2026)**
    *   Balanceamento do decaimento de PIB para capitanias menores
    *   Eventos regionalizados (seca regional Nordeste)
    *   Evento histórico: Governo-Geral (1548), França Antártica (1555), Invasões Holandesas, Palmares, Ouro e Inconfidência
    *   Modularização e persistência de eventos e penalidades no GameState
    *   Criação de paleta e temas de pergaminho imersivos de época

*   **✅ Fase 2.5: Sistema de Transição de Era e Rankings (CONCLUÍDA em 16/06/2026)**
    *   Criação da tela de fechamento de era (calculadora de pontuação local)
    *   Interface para escolha: Caminho Ucrônico (extrapolação geográfica e de recursos) vs. Caminho Canônico (carregar história padrão da nova era)
    *   Leaderboard de Era em localStorage (rankings individuais por era)
    *   Design da matriz de mapeamento regional (Colônia -> Império, Império -> República, etc.)

*   **✅ Fase 2.7: Interface Dinâmica, Zoom e Visualizações de Mapa (CONCLUÍDA em 17/06/2026)**
    *   Implementação do Zoom D3 (scroll e pan) e botões flutuantes de ajuste.
    *   Desenho de ícones vetoriais interativos: portos (`⚓`), capitais (`⭐`) e bases de defesa (`🛡️`).
    *   Visualização de ferrovias construídas (nível de conexão rodoviária/tráfego $\ge 2$) no mapa D3 da Era Imperial e posteriores.
    *   Menu em abas para o dashboard esquerdo (`Governo`, `Territórios`, `Economia`) e painéis dinâmicos de legenda no mapa.
    *   Seletor de temas (Estilo Imersivo vs. Moderno Escuro persistente).

*   **✅ Fase 2.8: Sistema de Divergência Histórica (Ucronia) (CONCLUÍDA em 17/06/2026)**
    *   Fórmula ponderada e parametrizada em 6 dimensões.
    *   Painel gráfico com Gauge SVG interativo e gráfico de linha D3.js.
    *   Diário de decisões estratégicas e painel comparativo lado-a-lado com deltas.
    *   Script automatizado (`gerarHistoriaCanonica.js`) para geração do banco de dados canônico.

*   **✅ Fase 2.9: Refinamentos de UX e Lógica de Bandeiras (CONCLUÍDA em 22/06/2026)**
    *   Substituição do botão simples de Bandeiras por um modal estilo evento com prós/contras históricos.
    *   Lógica de expiração em 1690 e lembrete contextual em 1680 para as expedições coloniais.
    *   Menu de abas fixo (sticky) no topo do dashboard esquerdo.
    *   Navegação bidirecional: clicar em regiões do mapa redireciona e scrolla de forma suave ao card correspondente na aba de territórios com destaque visual animado.
    *   Aprimoramento do sistema de tooltips com explicações detalhadas para todas as variáveis de jogo.
    *   Robustez no carregamento absoluto do servidor para entrega de assets de imagem.

*   **✅ Fase 3.0 & 3.1: Realismo, Enciclopédia e Refinamentos de Interface (CONCLUÍDA em 22/06/2026)**
    *   **Territórios Inacessíveis:** Quando revolta atinge 100% ou o território é invadido/independente, todos os controles são bloqueados — apenas opções de Atacar (250 Contos) ou Negociar (perda de arrecadação por 10 anos) estão disponíveis.
    *   **Cidades Históricas e Estradas no Mapa:** Ícones vetoriais de casinhas coloniais roxo pastel surgem no mapa D3 conforme cidades coloniais (ex: São Paulo, Rio, Salvador, Belém, Natal, Porto Alegre) são fundadas, com legendas pequenas e caminhos/estradas tracejados dinâmicos ligando-as.
    *   **Tooltip Dinâmico de Crise:** Status `⚠️ EM CRISE` passa a exibir, no hover, as causas específicas e a duração restante de cada penalidade ativa.
    *   **Biblioteca Histórica (Aba 📚):** Enciclopédia in-game com linha do tempo, ciclos econômicos, personalidades históricas e dados reais por território, incluindo busca textual em tempo real.
    *   **Modais de Confirmação:** Janelas customizadas e estilizadas para "Reiniciar" e "Limpar Histórico".
    *   **Consolidado de Ucronia:** Exibição do fechamento da Era Colonial quando o jogador avança para o Império (sem dados calibrados).

*   **🔲 Fase 3.5: Era do Império (1822–1889)**
    *   Novos dados em `data/estados_1822.js` (20 Províncias) — já criado, aguarda mecânicas
    *   Mecânicas de Constituição, Poder Moderador, satisfação popular ativa
    *   Abolição gradual da escravidão com trade-offs políticos e econômicos
    *   Eventos imperiais (Farroupilha, Cabanagem, Guerra do Paraguai)

*   **🔲 Fase 4: Era da República e Modernidade (1889–1988)**
    *   Novos dados em `data/estados_1889.js` (20 estados)
    *   Industrialização, urbanização, rodovias modernas
    *   Mecânica ativa de inflação e estabilidade política (Vargas, Ditadura Militar)

*   **🔲 Fase 5: Era Contemporânea e Futura (1988–2026+)**
    *   Novos dados em `data/estados_1988.js` e `data/estados_2026.js` (27 estados)
    *   Plano Real, metas de juros/inflação, commodities modernas
    *   Transição energética, inteligência artificial, créditos de carbono (Ficção futurista)

---

## 10. Sistemas de Resgate Financeiro (Bailouts / Empréstimos)

O simulador implementa resgates financeiros em caso de insolvência fiscal (quando o Tesouro Nacional cai abaixo de 50 contos). Cada Era possui seu próprio mecanismo de resgate estruturado com trade-offs históricos:

### 10.1 Era Colonial: Socorro do Erário Régio
* **Trigger:** Disponível no painel esquerdo na Era Colonial quando `tesouro_nacional < 50`.
* **Efeito:** Recebe **+400 Contos de Réis** imediatos.
* **Trade-off/Penalidades:**
  * **Arrocho Tributário:** A retenção fiscal da União (`retencao_uniao`) aumenta permanentemente em **+5%** (`+0.05`) em todas as capitanias, drenando receita local.
  * **Comissário Régio:** O índice de revolta (`indice_revolta`) sobe imediatamente em **+15%** em todas as capitanias pela presença física de oficiais cobradores enviados de Lisboa.
  * **Juros do Erário:** Registra uma amortização fixa de **-15 contos/ano** por 25 anos nas variáveis globais.

### 10.2 Era Imperial: Empréstimo de Londres
* **Trigger:** Disponível no painel esquerdo na Era Imperial quando `tesouro_nacional < 50`.
* **Efeito:** Recebe **+600 Contos de Réis** imediatos.
* **Trade-off/Penalidades:**
  * **Serviço da Dívida:** Registra juros fixos de **-35 contos/ano** por 20 anos nas variáveis globais.
  * **Dreno de Capital:** Insere um multiplicador de PIB global que reduz a taxa de crescimento econômico de todas as províncias imperiais em **-0.5%** ao ano (fator `0.995`) por 20 anos.

---

## 11. Sistema de Divergência Histórica (Ucronia)

Este sistema funciona como um espelho informativo em tempo real sobre o quanto o rumo governamental e as decisões estratégicas do jogador divergem da história real do Brasil. É puramente informativo e não aplica bônus ou punições de jogabilidade.

### 11.1 O Índice de Divergência Ponderado
A divergência atual do jogador ($D$) é um valor percentual ($0$ a $100\%$) calculado a partir de $6$ dimensões com pesos específicos:

1. **PIB Nacional (Peso: 25%):** Mede a diferença relativa do PIB total:
   $$S_{pib} = \min\left(1.0, \frac{|PIB_{jogador} - PIB_{real}|}{PIB_{real}}\right)$$
2. **Tesouro Nacional (Peso: 15%):** Mede o caixa do governo:
   $$S_{tesouro} = \min\left(1.0, \frac{|Tesouro_{jogador} - Tesouro_{real}|}{\max(|Tesouro_{real}|, 50.0)}\right)$$
3. **População Total (Peso: 10%):** Mede a diferença demográfica:
   $$S_{pop} = \min\left(1.0, \frac{|Pop_{jogador} - Pop_{real}|}{Pop_{real}}\right)$$
4. **Estabilidade Social (Peso: 15%):** Mede a diferença da média nacional de revolta:
   $$S_{revolta} = \min\left(1.0, \frac{|Revolta_{jogador} - Revolta_{real}|}{100}\right)$$
5. **Infraestrutura Média (Peso: 15%):** Mede a média combinada de portos e estradas:
   $$S_{infra} = \min\left(1.0, \frac{ScorePortos + ScoreEstradas}{2}\right)$$
   *(Onde cada score individual é calculado como $\frac{|Jogador - Real|}{\max(Real, 1.0)}$)*
6. **Decisões Históricas (Peso: 20%):** A proporção de escolhas em eventos de bifurcação que divergem do caminho canônico:
   $$S_{decisoes} = \frac{\text{Escolhas Ucrônicas}}{\text{Total de Escolhas Efetuadas}}$$

A fórmula geral da divergência é:
$$D = \left(0.25 \cdot S_{pib} + 0.15 \cdot S_{tesouro} + 0.10 \cdot S_{pop} + 0.15 \cdot S_{revolta} + 0.15 \cdot S_{infra} + 0.20 \cdot S_{decisoes}\right) \cdot 100$$

### 11.2 Interpolação Linear e Gabarito Histórico
* **Gabarito Canônico:** Os dados reais da história são gerados pela própria engine de simulação rodando sob decisões canônicas em `data/historia_canonica.js`.
* **Interpolação de Turno:** Como os snapshots canônicos são armazenados a cada $5$ anos, a engine e a view utilizam interpolação linear para obter as estimativas canônicas "esperadas" exatas para anos fracionados intermediários.

### 11.3 Comportamento em Transição de Eras
A divergência é calculada por Era:
* **Caminho Canônico:** O histórico do jogador é resetado, e como o novo estado da era inicia com os dados históricos reais da nova era, a divergência inicial é $0.0\%$.
* **Caminho Ucrônico:** O histórico e as decisões são mantidos, e a divergência de base inicial na nova era é herdada do fechamento ucrônico da era anterior.

---

## 12. Mecânica de Territórios Inacessíveis _(Fase 3.0 & 3.1 — Concluída)_

Para dar realismo às invasões e revoltas extremas, territórios em determinadas condições tornam-se **inacessíveis**: seus controles normais são bloqueados e o jogador só pode tomar ações de alto nível para recuperar o controle.

### 12.1 Condições de Inacessibilidade
| Condição | `status_territorio` | Cor no Mapa |
|---|---|---|
| `indice_revolta >= 100%` | `"rebelado"` | Vermelho intenso (padrão de crise) |
| Invadido por nação estrangeira | `"invadido"` | Azul-escuro (ex: holandeses) |
| Declarado independente | `"independente"` | Roxo/cinza |

### 12.2 Novos Campos no Estado
Cada entidade regional pode conter os campos opcionais:
```js
status_territorio: "controlado", // "controlado" | "rebelado" | "invadido" | "independente"
invadido_por: null,              // string do invasor, ex: "holanda"
duracao_invasao: 0               // anos restantes da ocupação
```

### 12.3 Ações Disponíveis no Estado Inacessível
- **⚔️ Atacar:** Custo em Tesouro (variável conforme força do inimigo). Reduz drasticamente a revolta ou encerra a invasão. Pode falhar se a milícia local for muito baixa.
- **🤝 Negociar:** Aceita penalidade econômica (perda de receita ou PIB por N anos) mas recupera o controle mais rapidamente e sem risco de falha.

### 12.4 Integração com Eventos Existentes
O evento `invasao_holandesa_1630` (opção "Capitular") passará a setar `status_territorio = "invadido"` + `invadido_por = "holanda"` + `duracao_invasao = 20`. Após 20 anos (ou intervenção do jogador), o território retorna a `"controlado"`.

---

## 13. Cidades Históricas e Estradas no Mapa _(Fase 3.0 & 3.1 — Concluída)_

Algumas cidades-chave surgem historicamente durante o jogo. Quando o ano passa por um marco de fundação, um pequeno ícone discreito (ponto ou `🏙️`) aparece no mapa D3 com tooltip contendo o nome, ano de fundação e importância histórica.

### 13.1 Arquivo de Dados
`data/cidades_historicas.js` — Novo arquivo declarativo com coordenadas no sistema GeoJSON e datas de fundação. Exemplos:
- Rio de Janeiro (1565), Ouro Preto (1711), São Luís (1612), Belém (1616), Fortaleza (1726)

### 13.2 Renderização
Camada `#mapa-cidades` adicionada ao mapa D3 em `view.js`, com animação de surgimento (opacidade 0→1) quando `ano_fundacao <= ano_atual`.

---

## 14. Biblioteca Histórica (Enciclopédia In-Game) _(Fase 3.0 & 3.1 — Concluída)_

Uma nova aba **📚 Biblioteca** que funciona como referência educativa e de apoio estratégico ao jogador.

### 14.1 Seções da Biblioteca
- **Linha do Tempo Interativa:** Eventos históricos reais vs. o que o jogador fez, lado a lado.
- **Ciclos Econômicos:** Descrição detalhada dos ciclos (Pau-Brasil, Açúcar, Ouro, Café) com dados reais de produção e impacto territorial.
- **Personalidades Históricas:** Fichas de Tomé de Sousa, Zumbi dos Palmares, Tiradentes, D. Pedro I, etc.
- **Enciclopédia de Territórios:** Card por capitania/província com texto histórico real, fundação e principais marcos.

### 14.2 Arquivos de Dados
`data/enciclopedia.js` — Arquivo com entradas estruturadas por categoria:
```js
export const enciclopedia = {
    ciclos: [...],
    personalidades: [...],
    territorios: [...],
    linha_do_tempo: [...]
};
```