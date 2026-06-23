import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_modal = '''    <!-- MODAL DE TRANSICAO DE ERA (Narrativo e Imersivo) -->
    <div id="modal-transicao-era" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.85); display: none; justify-content: center; align-items: center; z-index: 10000; backdrop-filter: blur(10px);">
        <div id="modal-transicao-inner" style="width: 600px; max-width: 94vw; max-height: 92vh; overflow-y: auto; background: var(--panel-bg); border: 2px solid var(--header-color); border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.7); text-align: center; display: flex; flex-direction: column;">

            <!-- Banner de Imagem com gradiente inferior -->
            <div id="transicao-banner-wrapper" style="position: relative; width: 100%; height: 220px; overflow: hidden; border-radius: 14px 14px 0 0; flex-shrink: 0;">
                <img id="transicao-banner-img" src="assets/img/eventos/independencia.png" alt="Independencia do Brasil" style="width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(to bottom, transparent, var(--panel-bg));"></div>
                <div id="transicao-badge-tipo" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.65); border: 1px solid var(--header-color); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: bold; color: var(--header-color); backdrop-filter: blur(4px);">&#x2705; Historica</div>
            </div>

            <!-- Corpo do modal -->
            <div style="padding: 20px 28px 28px; display: flex; flex-direction: column; gap: 16px;">

                <!-- Titulo e narrativa -->
                <div>
                    <h2 id="transicao-titulo" style="color: var(--header-color); margin: 0 0 10px; font-family: 'Cinzel', 'Playfair Display', serif; font-size: 22px;">Fim da Era Colonial</h2>
                    <p id="transicao-narrativa" style="font-size: 13px; line-height: 1.65; color: var(--text-color); opacity: 0.9; margin: 0; text-align: left; background: rgba(0,0,0,0.12); padding: 12px 16px; border-radius: 8px; border-left: 3px solid var(--header-color);"></p>
                </div>

                <!-- Grid de Metricas -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                    <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--panel-border); border-radius: 8px; padding: 10px 6px; text-align: center;">
                        <div style="font-size: 10px; opacity: 0.65; margin-bottom: 4px;">&#x1F4C5; Ano</div>
                        <div id="transicao-ano" style="font-size: 15px; font-weight: bold; color: var(--header-color);">-</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--panel-border); border-radius: 8px; padding: 10px 6px; text-align: center;">
                        <div style="font-size: 10px; opacity: 0.65; margin-bottom: 4px;">&#x1F4B0; Tesouro</div>
                        <div id="transicao-tesouro" style="font-size: 14px; font-weight: bold; color: #a6e3a1;">-</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--panel-border); border-radius: 8px; padding: 10px 6px; text-align: center;">
                        <div style="font-size: 10px; opacity: 0.65; margin-bottom: 4px;">&#x1F4C8; PIB</div>
                        <div id="transicao-pib" style="font-size: 14px; font-weight: bold; color: #89dceb;">-</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--panel-border); border-radius: 8px; padding: 10px 6px; text-align: center;">
                        <div style="font-size: 10px; opacity: 0.65; margin-bottom: 4px;">&#x1F3C6; Prestigio</div>
                        <div id="transicao-pontos" style="font-size: 14px; font-weight: bold; color: #f9e2af;">-</div>
                    </div>
                </div>

                <!-- Badge de Divergencia Historica -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(0,0,0,0.12); border-radius: 8px; padding: 10px;">
                    <span style="font-size: 12px; opacity: 0.7;">Divergencia da Linha Real:</span>
                    <span id="transicao-divergencia" style="font-size: 14px; font-weight: bold; color: #cba6f7;">0%</span>
                    <span id="transicao-divergencia-label" style="font-size: 11px; opacity: 0.75; font-style: italic;">(Proximo da Historia Real)</span>
                </div>

                <!-- Caminhos para proxima era -->
                <div style="border-top: 1px solid var(--panel-border); padding-top: 14px;">
                    <h3 style="font-size: 14px; margin: 0 0 12px; color: var(--text-color); opacity: 0.9;">Escolha o Caminho para a Proxima Era</h3>
                    <div style="display: flex; gap: 12px; flex-direction: column;">
                        <button id="btn-transicao-ucronica" class="btn-escolha" style="padding: 14px 16px; text-align: left; border: 1px solid var(--header-color); border-radius: 10px; background: rgba(255,255,255,0.04); color: var(--text-color); cursor: pointer; transition: all 0.2s; font-family: inherit;">
                            <strong style="display: block; font-size: 14px; color: var(--header-color); margin-bottom: 5px;">&#x1F33F; Caminho Ucronico &mdash; Heranca Acumulada</strong>
                            <span style="font-size: 11px; opacity: 0.8; display: block; line-height: 1.4;">A proxima era herda o Tesouro, PIB e toda a infraestrutura construida. Os avancos da Era Colonial moldam a historia alternativa.</span>
                        </button>
                        <button id="btn-transicao-canonica" class="btn-escolha" style="padding: 14px 16px; text-align: left; border: 1px solid var(--panel-border); border-radius: 10px; background: rgba(255,255,255,0.03); color: var(--text-color); cursor: pointer; transition: all 0.2s; font-family: inherit;">
                            <strong style="display: block; font-size: 14px; color: var(--header-color); margin-bottom: 5px;">&#x1F4DC; Caminho Canonico &mdash; Historia Real</strong>
                            <span style="font-size: 11px; opacity: 0.8; display: block; line-height: 1.4;">A proxima era comeca com os dados historicos reais de 1822. O jogo recalibra para a linha do tempo oficial do Brasil Imperial.</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>'''

# Use regex to replace the old modal
pattern = r'    <!-- MODAL DE TRANSI.*?</div>\s*\n\s*<!-- MODAL DE EVENTO'
replacement = new_modal + '\n\n    <!-- MODAL DE EVENTO'

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
if new_content == content:
    print('No replacement made! Pattern not found.')
    # Debug: show area around the marker
    idx = content.find('modal-transicao-era')
    print(f'marker at index: {idx}')
    print(repr(content[idx-10:idx+100]))
else:
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('SUCCESS: Modal replaced successfully!')
    print('New length:', len(new_content))
