(function () {
    const btnSalvarVenda = document.querySelector('#btn-salvar-venda')
    const btnSalvarGasto = document.querySelector('#btn-salvar-gasto')
    let usuarioEhAdmin = true

    btnSalvarVenda.addEventListener('click', () => criarVenda())
    btnSalvarGasto.addEventListener('click', () => criarGasto())

    //Mascara para os inputs de valor
    const inputVenda = document.querySelector('#valor-venda')
    const inputGasto = document.querySelector('#valor-gasto')
    const inputEditValor = document.querySelector('#edit-valor')

    function formatarValorEmTempoReal(inputElement) {
        inputElement.addEventListener('input', function () {
            const apenasNumeros = this.value.replace(/\D/g, '')
            const centavos = (parseInt(apenasNumeros) || 0) / 100
            this.value = centavos.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        })
    }

    formatarValorEmTempoReal(inputGasto)
    formatarValorEmTempoReal(inputVenda)
    formatarValorEmTempoReal(inputEditValor)

    function formatarNumeroParaCampoMonetario(valor) {
        const numero = Number(valor) || 0
        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }


    //Código do toast para retorno ao usuário

    function showToast(mensagem, tipo = 'sucesso') {
        const toast = document.createElement('div')
        toast.className = `toast toast-${tipo}`
        toast.textContent = mensagem
        document.body.appendChild(toast)

        setTimeout(() => toast.remove(), 3000)
    }

    function obterDadosResumoSeguro(resposta) {
        const dados = (resposta && resposta.sucesso && resposta.dados) ? resposta.dados : {}
        return {
            listaGastos: Array.isArray(dados.listaGastos) ? dados.listaGastos : [],
            listaVendas: Array.isArray(dados.listaVendas) ? dados.listaVendas : []
        }
    }

    function mostrarAvisoPermissao(mensagem) {
        if (document.querySelector('#aviso-permissao-lancamentos')) return
        const aviso = document.createElement('div')
        aviso.id = 'aviso-permissao-lancamentos'
        aviso.textContent = mensagem
        aviso.style.margin = '12px 0'
        aviso.style.padding = '12px'
        aviso.style.borderRadius = '8px'
        aviso.style.backgroundColor = '#fff3cd'
        aviso.style.border = '1px solid #ffe69c'
        aviso.style.color = '#664d03'
        document.querySelector('.adicionar')?.prepend(aviso)
    }

    async function atualizarTabelaLancamentos() {
        const dataInicio = document.querySelector('#data-inicio').value
        const dataFim = document.querySelector('#data-fim').value
        document.querySelector('#tabela-body').innerHTML = ''
        const deveAplicarFiltro = Boolean(dataInicio && dataFim)
        if (deveAplicarFiltro) {
            await carregarUltimosLancamentos(dataInicio, dataFim)
            return
        }
        await carregarUltimosLancamentos()
    }

    function configurarTelaParaNaoAdmin() {
        mostrarAvisoPermissao('Você não possui permissão para visualizar os registros completos. Seu perfil permite criar gastos e vendas e visualizar apenas seus lançamentos de hoje.')
        document.querySelector('#data-inicio').disabled = true
        document.querySelector('#data-fim').disabled = true
        document.querySelector('#btn-filtrar-tabela').disabled = true
        const colunaAcao = document.querySelector('.tabela-ultimos-lancamentos-tela-lancamentos thead th:last-child')
        if (colunaAcao) {
            colunaAcao.style.display = 'none'
        }
    }


    //função para criar uma venda
    async function criarVenda() {
        btnSalvarVenda.disabled = true
        const dataVenda = document.querySelector('#data-venda').value
        const valorReal = document.querySelector('#valor-venda').value
        const usuarioLogado = await window.api.auth.buscarSessao()
        const nomeUser = usuarioLogado.dados.login


        //Converter o input valor de 1.234,56 para 1234.56
        const valorVenda = parseFloat(
            valorReal.replace(/\./g, '').replace(',', '.'))

        try {
            const res = await window.api.venda.criar({ dataVenda, valorVenda, nome_user: nomeUser })
            if (res.sucesso) {
                showToast('Venda criada com sucesso!')
                document.querySelector('#data-venda').value = ''
                document.querySelector('#valor-venda').value = ''
                await atualizarTabelaLancamentos()
            } else {
                showToast(res.mensagem, 'erro')
            }
        } finally {
            btnSalvarVenda.disabled = false
        }
    }

    //função para criar um gasto
    async function criarGasto() {
        btnSalvarGasto.disabled = true
        const dataGasto = document.querySelector('#data-gasto').value
        const valorReal = document.querySelector('#valor-gasto').value
        const descricaoGasto = document.querySelector('#descricao-gasto').value
        const fixoVariavel = document.querySelector('input[name="fixo-variavel"]:checked').value
        const usuarioLogado = await window.api.auth.buscarSessao()
        const nomeUser = usuarioLogado.dados.login


        //Converter o input valor de 1.234,56 para 1234.56
        const valorGasto = parseFloat(
            valorReal.replace(/\./g, '').replace(',', '.'))


        try {
            const res = await window.api.gasto.criar({ dataGasto, valorGasto, descricaoGasto, fixoVariavel, categoria: 1, nome_user: nomeUser })
            if (res.sucesso) {
                showToast('Gasto criado com sucesso!')
                document.querySelector('#data-gasto').value = ''
                document.querySelector('#valor-gasto').value = ''
                document.querySelector('#descricao-gasto').value = ''
                document.querySelector('#input-fixo').checked = true
                await atualizarTabelaLancamentos()

            } else {
                showToast(res.mensagem, 'erro')
            }
        } finally {
            btnSalvarGasto.disabled = false
        }
    }

    //Lógica para puxar dados da tabela em um periodo específico
    const btnTabela = document.querySelector('#btn-filtrar-tabela')
    btnTabela.addEventListener('click', () => {
        if (!usuarioEhAdmin) return
        const data_inicio = document.querySelector('#data-inicio').value
        const data_fim = document.querySelector('#data-fim').value
        carregarUltimosLancamentos(data_inicio, data_fim)
    })

    //função para chamada da tabela de ultimos lançamentos
    async function carregarUltimosLancamentos(dataInicio, dataFim) {
        const resposta = usuarioEhAdmin
            ? await window.api.dashboardResumo.resumo({
                dataInicio: dataInicio,
                dataFim: dataFim
            })
            : await window.api.dashboardResumo.lancamentosDoDiaUsuario()
        if (!resposta?.sucesso) {
            const mensagem = usuarioEhAdmin
                ? (resposta?.mensagem || 'Você não tem permissão para visualizar os lançamentos do período.')
                : (resposta?.mensagem || 'Não foi possível carregar os lançamentos de hoje.')
            showToast(mensagem, 'erro')
        }
        const dados = obterDadosResumoSeguro(resposta)


        let ultimosLancamentos = [] //Declaração do array dos ultimos lançamentos
        if (ultimosLancamentos) {
            let listaGastos = dados.listaGastos //coleta os gastos dos ultimos 30 dias ao carregar o app
            let listaVendas = dados.listaVendas //coleta as vendas dos ultimos 30 dias ao carregar o app
            ultimosLancamentos = [
                ...listaGastos,
                ...listaVendas
            ]

            //Ordenar o array por data_criacao, os mais recentes primeiro.
            ultimosLancamentos.sort((a, b) => {
                const dataA = new Date(a.data_criacao).getTime();
                const dataB = new Date(b.data_criacao).getTime();
                return dataB - dataA
            })
        }

        ultimosLancamentos.map((item) => {
            //função para formatar valor para REAL
            const formatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(item.valor);

            //função para formatação da data
            const dataParaFormatar = new Date(item.data)
            const dataFormatada = dataParaFormatar.toLocaleDateString('pt-BR', { timeZone: 'UTC' })

            //SVG dos ICONES DA COLUNA DE AÇÃO
            const deletIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
            const editIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>'


            //criação dos elementos da tabela
            const linhaTabela = document.createElement("tr")
            const colunaData = document.createElement("td")
            const colunaTipo = document.createElement("td")
            const nomeTipo = document.createElement("span")
            const colunaDescricao = document.createElement("td")
            const colunaCategoria = document.createElement("td")
            const colunaValor = document.createElement("td")
            const colunaAcao = document.createElement("td")
            const acaoEdit = document.createElement("a")
            const acaoDelete = document.createElement("a")
            const div = document.createElement("div")


            //inserção dos dados nas colunas
            colunaData.textContent = dataFormatada

            nomeTipo.textContent = item.tipo
            if (item.tipo === 'gasto') {
                nomeTipo.classList.add("gasto-dashboard-tag")
            }
            if (item.tipo === 'venda') {
                nomeTipo.classList.add('venda-dashboard-tag')
            }
            colunaDescricao.textContent = item.descricao
            colunaCategoria.textContent = item.fixo_variavel ?? 'Venda'
            colunaValor.textContent = formatado

            //Estruturação da tabela
            colunaTipo.appendChild(nomeTipo)
            linhaTabela.appendChild(colunaData)
            linhaTabela.appendChild(colunaTipo)
            linhaTabela.appendChild(colunaDescricao)
            linhaTabela.appendChild(colunaCategoria)
            linhaTabela.appendChild(colunaValor)

            if (usuarioEhAdmin) {
                acaoEdit.innerHTML = editIcon
                acaoEdit.classList.add("botao-editar")
                acaoEdit.title = "Editar"
                acaoEdit.dataset.item = JSON.stringify(item)
                acaoEdit.addEventListener('click', function () {
                    const item = JSON.parse(this.dataset.item)
                    abrirModalEdicao(item)
                })
                colunaAcao.appendChild(acaoEdit)

                acaoDelete.innerHTML = deletIcon
                acaoDelete.classList.add("botao-deletar")
                acaoDelete.title = "Deletar"
                acaoDelete.dataset.item = JSON.stringify(item)
                acaoDelete.addEventListener('click', function () {
                    const item = JSON.parse(this.dataset.item)
                    abrirModalDelete(item)
                })
                colunaAcao.appendChild(acaoDelete)
                linhaTabela.appendChild(colunaAcao)
            }



            document.querySelector("#tabela-body").appendChild(linhaTabela)

            //FIM DA CONSTRUÇÃO DA TABELA

        })
    }

    async function deletarDado(item) {
        const usuarioLogado = await window.api.auth.buscarSessao()
        item.nome_user = usuarioLogado.dados.login
        if(item.tipo === "gasto") {
            console.log(item)
            const res = await window.api.gasto.deletar(item)
            if(res.sucesso) {
                showToast("Gasto deletado com sucesso!")
                await atualizarTabelaLancamentos()
            }else{
                showToast(res.mensagem, 'erro')
            }
        }if(item.tipo === "venda") {
            console.log(item)
            const res = await window.api.venda.deletar(item)
            if(res.sucesso) {
                showToast("Venda deletada com sucesso!")
                await atualizarTabelaLancamentos()
            }else{
                showToast(res.mensagem, 'erro')
            }
        }
    }


    function abrirModalDelete(item) {
       const modal = document.querySelector('#modal-confirmar-delete')
       modal.classList.remove("modal-escondido")
       modal.classList.add("modal-visivel")
       
       document.querySelector("#confirm-delete-modal").addEventListener('click', () => {
        deletarDado(item)
        modal.classList.remove("modal-visivel")
        modal.classList.add("modal-escondido")
       })
    }


    function abrirModalEdicao(item) {

        // Preenche o input hidden com o id do registro.
        // Esse valor será lido pelo botão salvar para saber
        // qual linha do banco de dados deve ser atualizada.
        document.getElementById('edit-id').value = item.id

        // Preenche o input hidden com o tipo do registro ("gasto" ou "venda").
        // O botão salvar usa esse valor para decidir qual API chamar.
        document.getElementById('edit-tipo').value = item.tipo

        // Preenche o campo de data com a data do registro
        document.getElementById('edit-data').value = item.data

        // Preenche o campo de valor já formatado em padrão monetário pt-BR
        document.getElementById('edit-valor').value = formatarNumeroParaCampoMonetario(item.valor)

        // Verifica se o item é um gasto para mostrar os campos exclusivos
        if (item.tipo === 'gasto') {

            // Preenche o campo de descrição com a descrição do gasto
            document.getElementById('edit-descricao').value = item.descricao

            // Busca o radio button cujo value bate com o fixo_variavel do item.
            // Se item.fixo_variavel for "Fixo", encontra o input com value="Fixo"
            // e marca ele como selecionado.
            const radioCorreto = document.querySelector(
                `input[name="edit-fixo-variavel"][value="${item.fixo_variavel}"]`
            )

            // Só marca se encontrou o radio, evitando erro caso venha undefined
            if (radioCorreto) radioCorreto.checked = true

            // Remove a classe que esconde os campos de gasto, tornando-os visíveis
            document.getElementById('campos-gasto').classList.remove('campos-escondidos')

        } else {

            // Se for venda, garante que os campos de gasto estão escondidos
            document.getElementById('campos-gasto').classList.add('campos-escondidos')
        }

        // Pega o elemento do modal
        const modal = document.getElementById('modal-edicao')

        // Remove a classe que esconde e adiciona a que exibe como flex
        modal.classList.remove('modal-escondido')
        modal.classList.add('modal-visivel')
    }


    // Fechar o modal de edição ao clicar no overlay
    document.getElementById('modal-edicao').addEventListener('click', function (event) {
        if (event.target === this) {
            this.classList.remove('modal-visivel')
            this.classList.add('modal-escondido')
        }
    })

    // Fechar o modal de delete ao clicar no overlay
    document.getElementById('modal-confirmar-delete').addEventListener('click', function (event) {
        if (event.target === this) {
            this.classList.remove('modal-visivel')
            this.classList.add('modal-escondido')
        }
    })

    // Fechar o modal de edição ao cancelar
    document.getElementById('btn-cancelar-edicao').addEventListener('click', function () {
        const modal = document.getElementById('modal-edicao')
        // Inverte as classes — esconde o modal novamente
        modal.classList.remove('modal-visivel')
        modal.classList.add('modal-escondido')
    })

    // Fechar o modal de edição ao clicar no X
    document.getElementById('btn-fechar-modal-edicao').addEventListener('click', function () {
        const modal = document.getElementById('modal-edicao')
        // Inverte as classes — esconde o modal novamente
        modal.classList.remove('modal-visivel')
        modal.classList.add('modal-escondido')
    })

    // Fechar o modal de delete ao cancelar
    document.getElementById('cancelar-delete-modal').addEventListener('click', function () {
        const modal = document.getElementById('modal-confirmar-delete')
        // Inverte as classes — esconde o modal novamente
        modal.classList.remove('modal-visivel')
        modal.classList.add('modal-escondido')
    })

    // Salvar os dados do modal de edição
    document.getElementById('btn-salvar-edicao').addEventListener('click', async function () {

        // Lê o id do input hidden — identifica qual registro atualizar no banco
        const id = document.getElementById('edit-id').value

        // Lê o tipo do input hidden — decide qual API chamar
        const tipo = document.getElementById('edit-tipo').value

        // Lê a data do campo de data
        const data = document.getElementById('edit-data').value

        // Lê o valor e converte de string formatada para número:
        // "1.234,56" → remove pontos → "1234,56" → troca vírgula por ponto → "1234.56" → parseFloat → 1234.56
        const valor = parseFloat(
            document.getElementById('edit-valor').value
                .replace(/\./g, '')   // remove pontos de milhar
                .replace(',', '.')    // troca vírgula decimal por ponto
        )

        // Variável que vai receber o retorno da API
        let response

        if (tipo === 'gasto') {

            // Lê a descrição do campo de texto
            const descricao = document.getElementById('edit-descricao').value

            // Lê qual radio está marcado e pega o value dele ("Fixo" ou "Variavel")
            const fixoVariavel = document.querySelector(
                'input[name="edit-fixo-variavel"]:checked'
            ).value
            const usuarioLogado = await window.api.auth.buscarSessao()
            const nomeUser = usuarioLogado.dados.login
            // Chama a API de edição de gasto com todos os dados necessários
            response = await window.api.gasto.editar({ id, data, valor, descricao, fixoVariavel, nome_user: nomeUser })

        } else {
            const usuarioLogado = await window.api.auth.buscarSessao()
            const nomeUser = usuarioLogado.dados.login
            // Venda só precisa de id, data e valor para editar
            response = await window.api.venda.editar({ id, data, valor, nome_user: nomeUser})
        }

        if (response.sucesso) {

            // Mostra o toast de sucesso
            showToast('Lançamento alterado com sucesso!')

            // Fecha o modal trocando as classes
            const modal = document.getElementById('modal-edicao')
            modal.classList.remove('modal-visivel')
            modal.classList.add('modal-escondido')
            await atualizarTabelaLancamentos()

        } else {

            // Mostra o erro retornado pelo backend sem fechar o modal,
            // permitindo que o usuário corrija os dados e tente novamente
            showToast(response.mensagem, 'erro')
        }
    })



    

    async function inicializarPermissoesECarregarDados() {
        const usuarioLogado = await window.api.auth.buscarSessao()
        usuarioEhAdmin = !!usuarioLogado?.dados?.admin
        if (!usuarioEhAdmin) {
            configurarTelaParaNaoAdmin()
        }
        await carregarUltimosLancamentos()
    }

    inicializarPermissoesECarregarDados()

})()