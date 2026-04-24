(function () {
  const pagina = document.getElementsByClassName('dashboard')
  const adminOrUser = userIsAdmin()
  const inputDataInicio = document.querySelector('#data-inicio')
  const inputDataFim = document.querySelector('#data-fim')
  const resumoPeriodo = document.querySelector('#resumo-periodo-dashboard')

  function formatarDataInputParaPtBr (valor) {
    if (!valor) return ''
    const [ano, mes, dia] = valor.split('-')
    if (!ano || !mes || !dia) return valor
    return `${dia}/${mes}/${ano}`
  }

  function obterDataInput(offsetDias = 0) {
    const data = new Date()
    data.setDate(data.getDate() + offsetDias)
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  function atualizarTextoResumoPeriodo(dataInicio, dataFim) {
    if (!resumoPeriodo) return
    if (!dataInicio || !dataFim) {
      resumoPeriodo.textContent = 'Resumo dos últimos 30 dias'
      return
    }
    resumoPeriodo.textContent = `Resumo do período de ${formatarDataInputParaPtBr(dataInicio)} até ${formatarDataInputParaPtBr(dataFim)}`
  }

  function definirPeriodoInicialDashboard() {
    if (!inputDataInicio || !inputDataFim) return
    if (!inputDataFim.value) {
      inputDataFim.value = obterDataInput(0)
    }
    if (!inputDataInicio.value) {
      inputDataInicio.value = obterDataInput(-30)
    }
    atualizarTextoResumoPeriodo(inputDataInicio.value, inputDataFim.value)
  }

  //Função que retorna se o usuário é administrador ou não.
  async function userIsAdmin () {
    const usuarioLogado = await window.api.auth.buscarSessao()
    return usuarioLogado.dados.admin
}

  //Declaração dos Gráficos do dashboard
  const ctx = document.getElementById('gastosPorCategoriasChart');
  const ctx2 = document.getElementById('graph-pizza-dashboard');

  let pizzaGrafico = null
  let linhaGrafico = null

  //Função para filtrar os gastos por período selecionado pelo usuario pelos inputs
  const btn_filtrar = document.querySelector('#btn-filtrar-dashboard')
  btn_filtrar.addEventListener('click', () => {
    const dataInicio = inputDataInicio.value
    const dataFim = inputDataFim.value
    console.log(dataFim)
    atualizarTextoResumoPeriodo(dataInicio, dataFim)
    somarVendasGastosPorPeriodo(dataInicio, dataFim)
  })

  //FUNÇÃO PARA FORMATAR MOEDA PARA PADRÃO BRASILEIRO
  function formatarMoedaBR (item) {
    const formatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(item)
    return formatado
  }

  function obterDadosResumoSeguro(resposta) {
    const dados = (resposta && resposta.sucesso && resposta.dados) ? resposta.dados : {}
    return {
      listaGastos: Array.isArray(dados.listaGastos) ? dados.listaGastos : [],
      listaVendas: Array.isArray(dados.listaVendas) ? dados.listaVendas : [],
      somaVendas: dados.somaVendas || { total: 0 },
      somaGastos: dados.somaGastos || { total: 0 },
      saldo: Number(dados.saldo) || 0,
      fixoVariavelSoma: Array.isArray(dados.fixoVariavelSoma) ? dados.fixoVariavelSoma : [],
      vendaUltimoAno: Array.isArray(dados.vendaUltimoAno) ? dados.vendaUltimoAno : []
    }
  }

  function mostrarAvisoSemPermissao(mensagem = 'Você não tem permissão para visualizar os dados desta tela.') {
    if (document.querySelector('#aviso-sem-permissao-dashboard')) return
    const aviso = document.createElement('div')
    aviso.id = 'aviso-sem-permissao-dashboard'
    aviso.textContent = mensagem
    aviso.style.margin = '12px 0'
    aviso.style.padding = '12px'
    aviso.style.borderRadius = '8px'
    aviso.style.backgroundColor = '#fff3cd'
    aviso.style.border = '1px solid #ffe69c'
    aviso.style.color = '#664d03'
    document.querySelector('.dashboard')?.prepend(aviso)
  }

  //função para chamada da tabela de ultimos lançamentos
  async function carregarUltimosLancamentos() {
    const resposta = await window.api.dashboardResumo.resumo()
    if (!resposta?.sucesso) {
      mostrarAvisoSemPermissao(resposta?.mensagem)
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

      //FIM DA CONSTRUÇÃO DA TABELA

    })
  }


  async function somarVendasGastosPorPeriodo(dataInicio, dataFim) {

    //Requisição ao backend, retorna somaVendas, somaGastos, saldo, listaGastos, listaVendas, fixoVariavelSoma, vendaUltimoAno
    const resposta = await window.api.dashboardResumo.resumo({ dataInicio: dataInicio, dataFim: dataFim })
    if (!resposta?.sucesso) {
      mostrarAvisoSemPermissao(resposta?.mensagem)
    }
    const dados = obterDadosResumoSeguro(resposta)



    //Tratamento de dados para o gráfico de linhas das vendas
    const labels = dados.vendaUltimoAno.map(item => {
      const [ano, mes] = item.mes_ano.split('-'); //recebe do Banco de dados: aaaa-mm, separa em ano: aaaa, mes: mm
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']; //Lista dos nomes dos meses
      return `${meses[parseInt(mes) - 1]}/${ano.substring(2)}`; //Pega o número do mês do Banco de dados -1, e coloca como indice do array meses para retornar o nome
      //pega o valor do ano 4 digitos AAAA, e quebra nos 2 ultimos digitos AA
    });
    const valoresPorMes = dados.vendaUltimoAno.map(item => item.total); //Cria um array apenas com os valores separados.

    // Separa os valores fixos e variaveis recebidos do Banco de dados para uso nos gráficos
    const totalFixo = dados.fixoVariavelSoma.find(item => item.fixo_variavel === 'Fixo')?.total || 0;
    const totalVariavel = dados.fixoVariavelSoma.find(item => item.fixo_variavel === 'Variavel')?.total || 0;

    //calculos para fins de % do gráfico de pizza
    const gastoTotal = Number(dados.somaGastos.total) || 0
    const percentualFixos = gastoTotal > 0 ? ((totalFixo / gastoTotal) * 100).toFixed(2) : '0.00'
    const percentualVariavel = gastoTotal > 0 ? ((totalVariavel / gastoTotal) * 100).toFixed(2) : '0.00'

    //Renderizar os valores nos cards superiores (venda, gasto e saldo)
    document.querySelector('#card-total-venda-dashboard').innerHTML = `${formatarMoedaBR(dados.somaVendas.total) ?? '0,00'}`
    document.querySelector('#card-total-gasto-dashboard').innerHTML = `${formatarMoedaBR(dados.somaGastos.total) ?? '0,00'}`
    document.querySelector('#card-saldo-periodo-dashboard').innerHTML = `${formatarMoedaBR(dados.saldo) ?? '0,00'}`

    //Gráfico de pizza
    if (pizzaGrafico) {
      pizzaGrafico.destroy()
    }
    pizzaGrafico = new Chart(ctx, {
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

    //Gráfico em linha
    if (linhaGrafico) {
      linhaGrafico.destroy()
    }
    linhaGrafico = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: labels,

        datasets: [{
          label: 'Vendas Mensais (R$)',
          data: valoresPorMes,
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.3
        }]
      }
    })
  }

  definirPeriodoInicialDashboard()
  carregarUltimosLancamentos()
  somarVendasGastosPorPeriodo(inputDataInicio?.value, inputDataFim?.value)

})()