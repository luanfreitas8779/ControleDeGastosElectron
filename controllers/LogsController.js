const LogsService = require('../services/LogsService')

const LogsController = {
    buscarPorPeriodo(dados) {
        try {
            const logs = LogsService.buscarPorPeriodo(dados?.dataInicio, dados?.dataFim)
            return { sucesso: true, dados: logs }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}

module.exports = LogsController