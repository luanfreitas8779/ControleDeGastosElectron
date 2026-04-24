const VendaService = require('../services/VendaService')

const VendaController = {

    // Implementação do método criar
    criar(dados) {
        try {
            const venda = VendaService.criar(dados)
            return { sucesso: true, dados: venda }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    // Implementação do método editar
    editar(dados) {
        try {
            const venda = VendaService.editar(dados)
            return { sucesso: true, dados: venda }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    // Implementação do método deletar
    deletar(dados) {
        try {
            VendaService.deletar(dados)
            return { sucesso: true, mensagem: 'Venda excluída com sucesso' }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    //Lógica para listar todas as vendas por período
    buscarPorPeriodo(dados) {
        try {
            const vendas = VendaService.buscarPorPeriodo(dados?.dataInicio, dados?.dataFim)
            return { sucesso: true, dados: vendas }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    somarVendasPorPeriodo(dados) {
        try {
            const vendas = VendaService.somarVendasPorPeriodo(dados?.dataInicio, dados?.dataFim)
            return { sucesso: true, dados: vendas }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}

module.exports = VendaController