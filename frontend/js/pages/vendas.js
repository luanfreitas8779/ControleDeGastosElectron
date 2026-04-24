//função IIFE para não criar variáveis em escopo global, pois a variável global uma vez criada, permanece na página e causa bugs
(function () {
  //Declaração do Gráfico
  const ctx = document.getElementById('gráfico-de-linha-area-de-vendas');
  let linhaGrafico = null

  //Função para filtrar os gastos por período selecionado pelo usuario pelos inputs
  const btn_filtrar = document.querySelector('#button-filtrar-periodo-vendas')
  btn_filtrar.addEventListener('click', () => {
    const dataInicio = document.querySelector('#data-inicio').value
    const dataFim = document.querySelector('#data-fim').value
    buscarVendas(dataInicio, dataFim)
  })

  //função para formatar a moeda para padrão brasileiro
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
      listaVendas: Array.isArray(dados.listaVendas) ? dados.listaVendas : [],
      somaVendas: dados.somaVendas || { total: 0 },
      vendaUltimoAno: Array.isArray(dados.vendaUltimoAno) ? dados.vendaUltimoAno : []
    }
  }

  function mostrarAvisoSemPermissao(mensagem = 'Você não tem permissão para visualizar os dados desta tela.') {
    if (document.querySelector('#aviso-sem-permissao-vendas')) return
    const aviso = document.createElement('div')
    aviso.id = 'aviso-sem-permissao-vendas'
    aviso.textContent = mensagem
    aviso.style.margin = '12px 0'
    aviso.style.padding = '12px'
    aviso.style.borderRadius = '8px'
    aviso.style.backgroundColor = '#fff3cd'
    aviso.style.border = '1px solid #ffe69c'
    aviso.style.color = '#664d03'
    document.querySelector('.vendas')?.prepend(aviso)
  }

  async function buscarVendas(dataInicio, dataFim) {
    const resposta = await window.api.dashboardResumo.resumo({
      dataInicio: dataInicio,
      dataFim: dataFim
    })
    if (!resposta?.sucesso) {
      mostrarAvisoSemPermissao(resposta?.mensagem)
    }
    const dados = obterDadosResumoSeguro(resposta)

    //=======================INICIO INSERÇÃO DOS DADOS NOS CARDS =================================
    //Calculo da média diária


    const vendasPeriodo = dados.listaVendas
    const totalVendas = Number(dados.somaVendas.total) || 0
    const mediaDiaria = vendasPeriodo.length > 0 ? (totalVendas / vendasPeriodo.length) : 0
    //Fim calculo da média diária

    //função para reordenar o array de vendas por ordem de valor, do maior para o menor, a posição 0 é sempre o maior valor
    vendasPeriodo.sort((a, b) => {
      const dataA = a.valor
      const dataB = b.valor
      return dataB - dataA
    })
  
    let dataMaiorVenda = vendasPeriodo.length > 0 ? new Date(vendasPeriodo[0].data) : null
   

    document.querySelector('#valor-total-vendas-card').textContent = `${formatarMoedaBR(totalVendas)}` || '0,00'
    document.querySelector('#valor-media-diaria').textContent = `${formatarMoedaBR(mediaDiaria)}` || '0,00'
    document.querySelector('#valor-do-melhor-dia').textContent = `${formatarMoedaBR(vendasPeriodo[0]?.valor || 0)}` || '0,00'
    document.querySelector('#data-melhor-dia').textContent = dataMaiorVenda
      ? `${dataMaiorVenda.toLocaleDateString('pt-br', { timeZone: 'UTC' })}`
      : '--/--/----'
    //====================== FIM DA INSERÇÃO DOS DADOS NOS CARDS ==================================

    //Lógica para inserir os dados no gráfico de linhas da tela vendas.

    const labels = dados.vendaUltimoAno.map(item => {
      const [ano, mes] = item.mes_ano.split('-'); //recebe do Banco de dados: aaaa-mm, separa em ano: aaaa, mes: mm
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']; //Lista dos nomes dos meses
      return `${meses[parseInt(mes) - 1]}/${ano.substring(2)}`; //Pega o número do mês do Banco de dados -1, e coloca como indice do array meses para retornar o nome
      //pega o valor do ano 4 digitos AAAA, e quebra nos 2 ultimos digitos AA
    });
    const valoresPorMes = dados.vendaUltimoAno.map(item => item.total); //Cria um array apenas com os valores separados.


    //Gráfico em linha
    if (linhaGrafico) {
      linhaGrafico.destroy() //verifica se há um gráfico dentro da variável, se sim destroi ele para só depois criar outro.
    }
    linhaGrafico = new Chart(ctx, {
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

    //========================= Fim da lógica do gráfico de linhas ================================


    //========================= Lógica para inserção dos dados na tabela ==========================
    const ultimosLancamentos = dados.listaVendas
    ultimosLancamentos.sort((a, b) => {
      const dataA = new Date(a.data).getTime()
      const dataB = new Date(b.data).getTime()
      return dataA - dataB
    })

  

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
      colunaCategoria.textContent = item.fixo_variavel ?? 'Venda'
      colunaValor.textContent = formatado

      //Estruturação da tabela
      colunaTipo.appendChild(nomeTipo)
      linhaTabela.appendChild(colunaData)
      linhaTabela.appendChild(colunaTipo)
      linhaTabela.appendChild(colunaCategoria)
      linhaTabela.appendChild(colunaValor)

      document.querySelector("#tabela-vendas-periodo-body").appendChild(linhaTabela)
    })

      //FIM DA CONSTRUÇÃO DA TABELA


  }


  buscarVendas()
})()