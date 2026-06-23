with open('src/view.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """    
    // 3. Verificação de Modal de Fim de Era
    const modalTransicao = document.getElementById('modal-transicao-era');
    if (state.globais.fim_da_era) {
        if (modalTransicao) {
            const pibTotal = state.estados.reduce((acc, e) => acc + e.economia.pib_total, 0);
            const tesouro = state.globais.tesouro_nacional;
            const mediaRevolta = state.estados.reduce((acc, e) => acc + e.defesa.indice_revolta, 0) / state.estados.length;
            const pontos = Math.round(pibTotal * 1.0 + tesouro * 0.5 - mediaRevolta * 5);

            document.getElementById('transicao-titulo').innerText = era === "colonial" ? "Fim da Era Colonial" : "Fim da Era Imperial";
            document.getElementById('transicao-pib').innerText = `$${pibTotal.toFixed(2)} Contos`;
            document.getElementById('transicao-tesouro').innerText = `$${tesouro.toFixed(2)} Contos`;
            document.getElementById('transicao-pontos').innerText = `${pontos} pts`;

            modalTransicao.style.display = 'flex';
        }
    } else {
        if (modalTransicao) modalTransicao.style.display = 'none';
    }"""

new_block = """    
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
    }"""

if old_block in content:
    new_content = content.replace(old_block, new_block, 1)
    with open('src/view.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('SUCCESS: view.js updated!')
else:
    # Try to find the block without strict whitespace matching
    import re
    # Search for the key lines
    idx = content.find("// 3. Verifica")
    print(f"Found '// 3. Verifica' at index: {idx}")
    if idx >= 0:
        print(repr(content[idx-10:idx+200]))
