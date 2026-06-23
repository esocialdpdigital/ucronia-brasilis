with open('src/view.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_render = """function renderEventLog() {
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
}"""

new_render = """function renderEventLog() {
    const conteudoEl = document.getElementById('diario-bordo-conteudo');
    if (!conteudoEl) return;
    
    const logs = currentState.globais.eventLog || [];
    if (logs.length === 0) {
        conteudoEl.innerHTML = `<p style="opacity: 0.6; text-align: center; font-style: italic; padding: 20px 0; color: var(--text-color);">O Diário de Bordo está vazio. Avance alguns anos e tome decisões para gerar registros.</p>`;
        return;
    }
    
    conteudoEl.innerHTML = [...logs].reverse().map(item => {
        let tipoClass = "diario-item-tipo-info";
        if (item.tipo === "decisao") tipoClass = "diario-item-tipo-decisao";
        else if (item.tipo === "evento") tipoClass = "diario-item-tipo-evento";
        else if (item.tipo === "independencia") tipoClass = "diario-item-tipo-independencia";
        
        // Destaque especial para eventos de independência
        if (item.tipo === "independencia") {
            return `
                <div class="diario-item ${tipoClass}" style="border: 1px solid #a6e3a1; background: rgba(166, 227, 161, 0.08); border-radius: 8px; padding: 12px 14px; margin: 8px 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 18px;">🇧🇷</span>
                        <span class="diario-item-ano" style="color: #a6e3a1; font-weight: bold; font-size: 13px;">Ano ${item.ano}</span>
                        <span style="font-size: 10px; background: #a6e3a1; color: #1e1e2e; padding: 2px 8px; border-radius: 10px; font-weight: bold;">MARCO HISTÓRICO</span>
                    </div>
                    <span style="color: var(--text-color); font-size: 12px; line-height: 1.5;">${item.texto}</span>
                </div>
            `;
        }
        
        return `
            <div class="diario-item ${tipoClass}">
                <span class="diario-item-ano">Ano ${item.ano}</span>
                <span style="color: var(--text-color);">${item.texto}</span>
            </div>
        `;
    }).join('');
}"""

if old_render in content:
    new_content = content.replace(old_render, new_render, 1)
    with open('src/view.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('SUCCESS: renderEventLog updated!')
else:
    print('ERROR: old_render block not found exactly!')
    # Find it approximately
    idx = content.find('function renderEventLog')
    if idx >= 0:
        print(f'Found at char {idx}, line ~{content[:idx].count(chr(10))+1}')
        print(repr(content[idx:idx+300]))
