(function () {
    const FUSO_RONDONIA = 'America/Porto_Velho'

    function parseTimestampSqliteUtc (valor) {
        if (!valor) {
            return null
        }

        if (valor instanceof Date) {
            return valor
        }

        if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(valor)) {
            return new Date(valor.replace(' ', 'T') + 'Z')
        }

        const data = new Date(valor)
        return Number.isNaN(data.getTime()) ? null : data
    }

    function mostrarAvisoSemPermissao (mensagem = 'Você não possui permissão para visualizar esta tela.') {
        if (document.querySelector('#aviso-sem-permissao-logs')) return
        const aviso = document.createElement('div')
        aviso.id = 'aviso-sem-permissao-logs'
        aviso.textContent = mensagem
        aviso.style.margin = '12px 0'
        aviso.style.padding = '12px'
        aviso.style.borderRadius = '8px'
        aviso.style.backgroundColor = '#fff3cd'
        aviso.style.border = '1px solid #ffe69c'
        aviso.style.color = '#664d03'
        document.querySelector('.logs')?.prepend(aviso)
    }

    function bloquearFiltrosLogs () {
        const dataInicio = document.querySelector('#data-inicio')
        const dataFim = document.querySelector('#data-fim')
        const btnFiltrar = document.querySelector('#btn-filtrar-logs')
        if (dataInicio) dataInicio.disabled = true
        if (dataFim) dataFim.disabled = true
        if (btnFiltrar) btnFiltrar.disabled = true
    }


    /* -------------------------------------------------------------------------
       Formatação para o painel "Mais informações" (tooltip nas colunas Antes/Depois).
       Os dados vêm da API em formatos mistos; aqui normalizamos para texto legível.
       ------------------------------------------------------------------------- */

    /** Instância reutilizada para exibir valores monetários em real (BRL). */
    const fmtMoeda = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })

    /**
     * Converte um valor numérico (ou string numérica) para moeda brasileira.
     * Valores ausentes ou inválidos viram traço (—).
     */
    function formatarValor (valor) {
        if (valor === null || valor === undefined || valor === '') {
            return '—'
        }
        const n = Number(valor)
        if (Number.isNaN(n)) {
            return String(valor)
        }
        return fmtMoeda.format(n)
    }

    /**
     * Formata campos de data vindos do banco para o fuso de Rondônia.
     */
    function formatarDataCampo (valor) {
        if (valor === null || valor === undefined || valor === '') {
            return '—'
        }
        if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            const [ano, mes, dia] = valor.split('-')
            return `${dia}/${mes}/${ano}`
        }
        const d = parseTimestampSqliteUtc(valor)
        if (!d || Number.isNaN(d.getTime())) {
            return String(valor)
        }
        return d.toLocaleDateString('pt-BR', { timeZone: FUSO_RONDONIA })
    }

    /** Garante texto simples na lista; vazio/null/undefined vira traço (—). */
    function textoOuTraco (v) {
        if (v === null || v === undefined || v === '') {
            return '—'
        }
        return String(v)
    }

    /**
     * Lê fixo/variável (rótulo "Categoria" no tooltip) conforme o snapshot:
     * - Antes: o banco expõe `fixo_variavel` (snake_case).
     * - Depois: o payload costuma vir como `fixoVariavel` (camelCase).
     * Há fallback para o outro nome caso algum registro venha inconsistente.
     */
    function categoriaGastoPorMomento (dados, momento) {
        if (momento === 'antes') {
            return textoOuTraco(dados.fixo_variavel ?? dados.fixoVariavel)
        }
        return textoOuTraco(dados.fixoVariavel ?? dados.fixo_variavel)
    }

    /**
     * Monta a lista de pares rótulo/valor exibidos no tooltip, por tipo de log.
     * - venda: só Data e Valor.
     * - gasto: Data, Valor, Descrição e Categoria (fixo/variável; ver categoriaGastoPorMomento).
     * `momento` ('antes' | 'depois') só altera a leitura da categoria em gastos.
     * Objeto vazio retorna lista vazia (o chamador mostra um único —).
     */
    function obterLinhasPorTabela (tabela, dados, momento) {
        if (!dados || typeof dados !== 'object' || Object.keys(dados).length === 0) {
            return []
        }
        if (tabela === 'venda') {
            return [
                { label: 'Data', value: formatarDataCampo(dados.data) },
                { label: 'Valor', value: formatarValor(dados.valor) }
            ]
        }
        if (tabela === 'gasto') {
            return [
                { label: 'Data', value: formatarDataCampo(dados.data) },
                { label: 'Valor', value: formatarValor(dados.valor) },
                { label: 'Descrição', value: textoOuTraco(dados.descricao) },
                { label: 'Categoria', value: categoriaGastoPorMomento(dados, momento) }
            ]
        }
        return []
    }

    /**
     * Preenche um elemento do DOM com as linhas "Nome: valor" do tooltip.
     * Usa replaceChildren para não acumular nós ao reutilizar o mesmo padrão.
     */
    function criarMapaLinhas (linhas) {
        return linhas.reduce((map, { label, value }) => {
            map[label] = value
            return map
        }, {})
    }

    function calcularCamposModificados (linhasAntes, linhasDepois) {
        const mapaAntes = criarMapaLinhas(linhasAntes)
        const mapaDepois = criarMapaLinhas(linhasDepois)
        const todosOsLabels = new Set([...Object.keys(mapaAntes), ...Object.keys(mapaDepois)])
        const camposModificados = new Set()

        todosOsLabels.forEach((label) => {
            const valorAntes = mapaAntes[label] ?? '—'
            const valorDepois = mapaDepois[label] ?? '—'
            if (valorAntes !== valorDepois) {
                camposModificados.add(label)
            }
        })

        return camposModificados
    }

    function preencherListaInformacoes (container, tabela, dados, momento, camposModificados = new Set()) {
        container.replaceChildren()
        const linhas = obterLinhasPorTabela(tabela, dados, momento)
        // Sem dados (ex.: exclusão só com "depois" vazio): uma linha com traço.
        if (linhas.length === 0) {
            const linha = document.createElement('div')
            linha.className = 'logs-info-line'
            linha.textContent = '—'
            container.appendChild(linha)
            return
        }
        // Cada item vira uma linha "Rótulo: valor" com classes para o tema escuro do tooltip.
        linhas.forEach(({ label, value }) => {
            const linha = document.createElement('div')
            linha.className = 'logs-info-line'
            const rotulo = document.createElement('span')
            rotulo.className = 'logs-info-label'
            rotulo.textContent = label + ': '
            const val = document.createElement('span')
            val.className = 'logs-info-value'
            val.textContent = value

            if (camposModificados.has(label)) {
                linha.classList.add('logs-info-line-modificado')
                val.classList.add('logs-info-value-modificado')
            }

            linha.appendChild(rotulo)
            linha.appendChild(val)
            container.appendChild(linha)
        })
    }

    /**
     * Busca logs no período (ou padrão da API), limpa o corpo da tabela e renderiza cada linha.
     */
    async function exibirLogs (dataInicio, dataFim) {
        const dados = await window.api.logs.buscarPorPeriodo({
            dataInicio: dataInicio,
            dataFim: dataFim
        })
        if (!dados?.sucesso) {
            mostrarAvisoSemPermissao(dados?.mensagem || 'Você não possui permissão para visualizar esta tela.')
            bloquearFiltrosLogs()
            return
        }
        const ultimosLancamentos = dados.dados || []
        const tbody = document.querySelector("#tabela-logs-body")
        // Evita duplicar linhas se exibirLogs for chamada de novo (ex.: após filtrar).
        tbody.innerHTML = ''

        ultimosLancamentos.forEach((item) => {
            //função para formatar valor para REAL
            const formatado = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(item.valor);
      
            //função para formatação da data
            const dataParaFormatar = parseTimestampSqliteUtc(item.data_hora)
            const dataFormatada = dataParaFormatar
                ? dataParaFormatar.toLocaleDateString('pt-BR', { timeZone: FUSO_RONDONIA })
                : '—'
      
            //criação dos elementos da tabela
            const linhaTabela = document.createElement("tr")
            const colunaData = document.createElement("td")
            const colunaTipo = document.createElement("td")
            const nomeTipo = document.createElement("span")
            const colunaDescricao = document.createElement("td")
            const colunaUsuario = document.createElement("td")
            const colunaInformacoes = document.createElement("td")

            /* Coluna Informações: botão + tooltip (CSS abre à esquerda no hover do .logs-info-wrap). */
            const wrapInfo = document.createElement("div")
            wrapInfo.className = "logs-info-wrap"
            const btnMaisInformacoes = document.createElement("button")
            btnMaisInformacoes.type = "button"
            btnMaisInformacoes.className = "btn-mais-informacoes"
            btnMaisInformacoes.textContent = "Mais informações"

            const tooltip = document.createElement("div")
            tooltip.className = "logs-info-tooltip"
            const inner = document.createElement("div")
            inner.className = "logs-info-tooltip-inner"

            // Coluna esquerda do painel: estado anterior do registro (dados_antes).
            const colAntes = document.createElement("div")
            colAntes.className = "logs-info-col"
            const tituloAntes = document.createElement("div")
            tituloAntes.className = "logs-info-col-title"
            tituloAntes.textContent = "Antes"
            const listaAntes = document.createElement("div")
            listaAntes.className = "logs-info-list"
            const linhasAntes = obterLinhasPorTabela(item.tabela, item.dados_antes, 'antes')

            // Coluna direita: estado após a alteração (dados_depois; pode estar vazio em exclusões).
            const colDepois = document.createElement("div")
            colDepois.className = "logs-info-col"
            const tituloDepois = document.createElement("div")
            tituloDepois.className = "logs-info-col-title"
            tituloDepois.textContent = "Depois"
            const listaDepois = document.createElement("div")
            listaDepois.className = "logs-info-list"
            const linhasDepois = obterLinhasPorTabela(item.tabela, item.dados_depois, 'depois')
            const camposModificados = calcularCamposModificados(linhasAntes, linhasDepois)

            preencherListaInformacoes(listaAntes, item.tabela, item.dados_antes, 'antes', camposModificados)
            preencherListaInformacoes(listaDepois, item.tabela, item.dados_depois, 'depois', camposModificados)

            colAntes.appendChild(tituloAntes)
            colAntes.appendChild(listaAntes)
            colDepois.appendChild(tituloDepois)
            colDepois.appendChild(listaDepois)
            inner.appendChild(colAntes)
            inner.appendChild(colDepois)
            tooltip.appendChild(inner)
            wrapInfo.appendChild(btnMaisInformacoes)
            wrapInfo.appendChild(tooltip)
            
            //inserção dos dados nas colunas
            colunaData.textContent = dataFormatada
      
            nomeTipo.textContent = item.tabela
            if (item.tabela === 'gasto') {
              nomeTipo.classList.add("gasto-dashboard-tag")
            }
            if (item.tabela === 'venda') {
              nomeTipo.classList.add('venda-dashboard-tag')
            }
            

            if(item.tabela === 'venda') {
              const dataFormatadaDescricao = formatarDataCampo(item.dados_depois.data)

              colunaDescricao.textContent = `Venda dia ${dataFormatadaDescricao}`
            }
            if(item.tabela === "gasto") {
              colunaDescricao.textContent = item.dados_depois.descricao
            }

            colunaUsuario.textContent = item.nome_user
            // O td da coluna Informações contém só o wrapper (botão + tooltip posicionado em CSS).
            colunaInformacoes.appendChild(wrapInfo)
      
            //Estruturação da tabela
            colunaTipo.appendChild(nomeTipo)
            linhaTabela.appendChild(colunaData)
            linhaTabela.appendChild(colunaTipo)
            linhaTabela.appendChild(colunaDescricao)
            linhaTabela.appendChild(colunaUsuario)
            linhaTabela.appendChild(colunaInformacoes)
      
            tbody.appendChild(linhaTabela)
      
            //FIM DA CONSTRUÇÃO DA TABELA
      
          })
    }

    const btnFiltrarLogs = document.querySelector('#btn-filtrar-logs')
    if (btnFiltrarLogs) {
        btnFiltrarLogs.addEventListener('click', () => {
            const dataInicio = document.querySelector('#data-inicio')?.value
            const dataFim = document.querySelector('#data-fim')?.value
            exibirLogs(dataInicio, dataFim)
        })
    }
      
    exibirLogs()
})()