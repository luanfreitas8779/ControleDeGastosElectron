(function () {
    //Declaração dos Gráficos da tela de gastos
    const ctx = document.getElementById('grafico-linha-tela-gastos');
    const ctx2 = document.getElementById('grafico-pizza-tela-gastos');
    let pizzaGraficoTelaGastos = null
    let linhaGraficoTelaGastos = null


    // Lógica para a funcionalidade de buscar por data selecionada pelo usuário

    const btn_filtrar = document.querySelector('#btn-filtrar-gastos')
    btn_filtrar.addEventListener('click', () => {
        const dataInicio = document.querySelector('#data-inicio-tela-gastos').value
        const dataFim = document.querySelector('#data-fim-tela-gastos').value
        console.log(dataInicio)
        console.log(dataFim) 
        buscarDados(dataInicio, dataFim)
    })
    //função para formatar valores para padrão brasileiro
    function formatarMoedaBR (item) {
        const formatado = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(item)
        return formatado
      }

    function obterDadosGastoSeguro(resposta) {
        const dados = (resposta && resposta.sucesso && resposta.dados) ? resposta.dados : {}
        return {
            fixoVariavelSoma: Array.isArray(dados.fixoVariavelSoma) ? dados.fixoVariavelSoma : [],
            somaDosGastosDoPeriodo: dados.somaDosGastosDoPeriodo || { total: 0 },
            gastosUltimoAno: Array.isArray(dados.gastosUltimoAno) ? dados.gastosUltimoAno : [],
            gastosDoPeriodo: Array.isArray(dados.gastosDoPeriodo) ? dados.gastosDoPeriodo : []
        }
    }

    function mostrarAvisoSemPermissao(mensagem = 'Você não tem permissão para visualizar os dados desta tela.') {
        if (document.querySelector('#aviso-sem-permissao-gastos')) return
        const aviso = document.createElement('div')
        aviso.id = 'aviso-sem-permissao-gastos'
        aviso.textContent = mensagem
        aviso.style.margin = '12px 0'
        aviso.style.padding = '12px'
        aviso.style.borderRadius = '8px'
        aviso.style.backgroundColor = '#fff3cd'
        aviso.style.border = '1px solid #ffe69c'
        aviso.style.color = '#664d03'
        document.querySelector('.gastos')?.prepend(aviso)
    }


    async function buscarDados(dataInicio, dataFim) {
        const resposta = await window.api.gasto.buscarPorPeriodo({
            dataInicio: dataInicio,
            dataFim: dataFim
        })
        if (!resposta?.sucesso) {
            mostrarAvisoSemPermissao(resposta?.mensagem)
        }
        const dados = obterDadosGastoSeguro(resposta)

        //=======================INICIO INSERÇÃO DOS DADOS NOS CARDS =================================
        const totalFixo = dados.fixoVariavelSoma.find(item => item.fixo_variavel === 'Fixo')?.total || 0;
        const totalVariavel = dados.fixoVariavelSoma.find(item => item.fixo_variavel === 'Variavel')?.total || 0;
        const gastoTotal = Number(dados.somaDosGastosDoPeriodo.total) || 0
        document.querySelector('#card-gastos-fixos-tela-gastos').textContent = `${formatarMoedaBR(totalFixo)}` || '0,00'
        document.querySelector('#card-gastos-variaveis-tela-gastos').textContent = `${formatarMoedaBR(totalVariavel)}` || '0,00'
        document.querySelector('#card-gasto-total-tela-gastos').textContent = `${formatarMoedaBR(gastoTotal)}` || '0,00'
        //====================== FIM DA INSERÇÃO DOS DADOS NOS CARDS ==================================

        
        // =================== TRATAMENTO DOS DADOS PARA O GRÁFICO DE PIZZA ==============================
        
        //calculos para fins de % do gráfico de pizza

        const percentualFixos = gastoTotal > 0 ? ((totalFixo / gastoTotal) * 100).toFixed(2) : '0.00'
        const percentualVariavel = gastoTotal > 0 ? ((totalVariavel / gastoTotal) * 100).toFixed(2) : '0.00'
        // ==================== FIM TRATAMENTO DOS DADOS PARA O GRÁFICO DE PIZZA ==========================


        // ========================= INICIO TRATAMENTO DOS GASTOS POR MÊS PARA O GRÁFICO DE LINHAS ================

        const labels = dados.gastosUltimoAno.map(item => {
            const [ano, mes] = item.mes_ano.split('-'); //recebe do Banco de dados: aaaa-mm, separa em ano: aaaa, mes: mm
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']; //Lista dos nomes dos meses
            return `${meses[parseInt(mes) - 1]}/${ano.substring(2)}`; //Pega o número do mês do Banco de dados -1, e coloca como indice do array meses para retornar o nome
            //pega o valor do ano 4 digitos AAAA, e quebra nos 2 ultimos digitos AA
        });
        const valoresPorMes = dados.gastosUltimoAno.map(item => item.total); //Cria um array apenas com os valores separados.
        // =========================== FIM TRATAMENTO DOS GASTOS POR MES PARA O GRAFICO DE LINHAS ==================


        //============= GRÁFICO DE LINHAS =============
        if (linhaGraficoTelaGastos) {
            linhaGraficoTelaGastos.destroy()
        }
        linhaGraficoTelaGastos = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,

                datasets: [{
                    label: 'Gastos mensais (R$)',
                    data: valoresPorMes,
                    fill: true,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.3
                }]
            }
        })


        // ================ GRÁFICO DE PIZZA ==================
        if (pizzaGraficoTelaGastos) {
            pizzaGraficoTelaGastos.destroy()
        }
        pizzaGraficoTelaGastos = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: [
                    `Fixo ${percentualFixos}%`,
                    `Variavel ${percentualVariavel}%`
                ],
                datasets: [{
                    label: 'Gasto',
                    data: [totalFixo, totalVariavel],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 205, 86)'
                    ],
                    hoverOffset: 4
                }]
            }
        });

        // ================ LÓGICA PARA CRIAÇÃO DA TABELA DOS GASTOS REGISTRADOS ====================
        const ultimosLancamentos = dados.gastosDoPeriodo
        
        ultimosLancamentos.map((item) => {
            //função para formatar valor para REAL
            const formatado = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(item.valor);
      
            //função para formatação da data
            const dataParaFormatar = new Date(item.data)
            const dataFormatada = dataParaFormatar.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      
            //criação dos elementos da tabela
            const linhaTabela = document.createElement("tr")
            const colunaData = document.createElement("td")
            const colunaTipo = document.createElement("td")
            const nomeTipo = document.createElement("span")
            const colunaDescricao = document.createElement("td")
            const colunaCategoria = document.createElement("td")
            const colunaValor = document.createElement("td")
      
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
      
            document.querySelector("#tabela-dashboard-body").appendChild(linhaTabela)
    })
      

    }

    buscarDados()
})()