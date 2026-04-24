const Gasto = require('../models/Gasto')
const Log = require('../models/Log')

const GastoService = {
    criar(dados) {
        // regra: valor não pode ser zero ou negativo
        if (!dados.valorGasto || dados.valor <= 0) {
            throw new Error('Valor do gasto deve ser maior que zero')
        }

        // regra: categoria é obrigatória
        if (!dados.categoria) {
            throw new Error('Categoria é obrigatória')
        }

        // regra: data é obrigatória
        if (!dados.dataGasto) {
            throw new Error('Data é obrigatória')
        }
        // regra: fixo / variavel é obrigatório
        if(!dados.fixoVariavel) {
            throw new Error('Campo fixo/variável é obrigatório')
        }
        //regra: nome_user é obrigatório
        if(!dados.nome_user) {
            throw new Error('Nome de usuário é obrigatório')
        }
        const id = Gasto.criar(dados)
        return { mensagem: "Gasto criado com sucesso", id, ...dados }
    },

    //Lógica para editar um gasto
    editar(dados) {

        if (!dados.valor || dados.valor <= 0) {
            throw new Error('Valor do gasto deve ser maior que zero')
        }

        if (!dados.id) {
            throw new Error('ID do gasto é obrigatório para edição')
        }

        // Busca os dados atuais do gasto ANTES de editar.
        // Esses dados vão para o campo dados_antes do log.
        // Se não encontrar nenhum gasto com esse id, lança erro.
        const dadosAntigos = Gasto.buscarPorId(dados.id)
        if (!dadosAntigos) {
            throw new Error('Nenhum gasto encontrado com o ID fornecido')
        }

        // Edita o registro no banco com os novos dados
        const id = Gasto.editar(dados)

        // Registra o log com o antes e depois da edição
        Log.registrar({
            tabela: 'gasto',
            id_registro: dados.id,
            nome_user: dados.nome_user, // quem fez a alteração, vindo do front
            dados_antes: dadosAntigos,  // objeto com os dados originais
            dados_depois: dados         // objeto com os dados novos
        })

        return { mensagem: 'Gasto editado com sucesso', id, ...dados }
    },

    //Lógica para deletar um gasto
    deletar(dados) {
        if (!dados.id) {
            throw new Error('ID do gasto é obrigatório para exclusão')
        }

        // Busca os dados ANTES de excluir para registrar no log
        const dadosAntigos = Gasto.buscarPorId(dados.id)
        if (!dadosAntigos) {
            throw new Error('Nenhum gasto encontrado com o ID fornecido')
        }

        const id = Gasto.deletar(dados.id)
        if (id === 0) {
            throw new Error('Nenhum gasto encontrado com o ID fornecido')
        }

        // Registra o log com o antes da exclusão. Após excluir, não existe "depois".
        Log.registrar({
            tabela: 'gasto',
            id_registro: dados.id,
            nome_user: dados.nome_user || 'Desconhecido',
            dados_antes: dadosAntigos,
            dados_depois: {}
        })

        return { mensagem: "Gasto deletado com sucesso", id }

    },

    //Lógica para listar os gastos por período
    buscarPorPeriodo(dataInicio = null, dataFim = null) {

        const hoje = new Date()

        const fim = dataFim ?? hoje.toISOString().split('T')[0]

        const trintaDiasAtras = new Date()
        trintaDiasAtras.setDate(hoje.getDate() - 30)
        const inicio = dataInicio ?? trintaDiasAtras.toISOString().split('T')[0]
        const gastosDoPeriodo = Gasto.buscarPorPeriodo(inicio, fim)
        console.log(inicio, fim)
        const somaDosGastosDoPeriodo = Gasto.somarGastosPorPeriodo(inicio, fim)
        const gastosUltimoAno = Gasto.buscaGastoUltimoAno()
        const fixoVariavelSoma = Gasto.somarGastosFixosVariaveisPorPeriodo(inicio, fim)

        return {
            gastosDoPeriodo,
            somaDosGastosDoPeriodo,
            gastosUltimoAno,
            fixoVariavelSoma
        }
    },

    //Lógica para somar os gastos por período
    somarGastosPorPeriodo(dataInicio = null, dataFim = null) {
        const hoje = new Date()
        const trintaDiasAtras = new Date()
        trintaDiasAtras.setDate(hoje.getDate() - 30)
        const fim = dataFim ?? hoje.toISOString().split('T')[0]      
        const inicio = dataInicio ?? trintaDiasAtras.toISOString().split('T')[0]
        return Gasto.somarGastosPorPeriodo(inicio, fim)
    }

}


module.exports = GastoService