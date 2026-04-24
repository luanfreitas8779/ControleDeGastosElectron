// controllers/GastoController.js
const GastoService = require('../services/GastoService')

//Controller para lidar com as requisições relacionadas aos gastos
const GastoController = {
    criar(dados) {
        try {
            const gasto = GastoService.criar(dados)
            return { sucesso: true, dados: gasto }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    editar(dados) {
        try {
            const gasto = GastoService.editar(dados)
            return { sucesso: true, dados: gasto }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    deletar(dados) {
        try {
            const gasto = GastoService.deletar(dados)
            return { sucesso: true, dados: gasto }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    buscarPorPeriodo(dados) {
        try {
            const gastos = GastoService.buscarPorPeriodo(dados?.dataInicio, dados?.dataFim)
            return { sucesso: true, dados: gastos }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    somarGastosPorPeriodo(dados) {
        try {
            const gastos = GastoService.somarGastosPorPeriodo(dados?.dataInicio, dados?.dataFim)
            return { sucesso: true, dados: gastos }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}


module.exports = GastoController