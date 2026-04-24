const DashboardResumoService = require('../services/DashboardResumoService')

const DashboardResumoController = {
    resumo(dados) {
        try {
            const resumo = DashboardResumoService.resumo(dados?.dataInicio, dados?.dataFim)
            return { sucesso: true, dados: resumo }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    lancamentosDoDiaUsuario(dados) {
        try {
            const nomeUsuario = dados?.usuario_logado?.login
            const lancamentos = DashboardResumoService.lancamentosDoDiaUsuario(nomeUsuario)
            return { sucesso: true, dados: lancamentos }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}


module.exports = DashboardResumoController