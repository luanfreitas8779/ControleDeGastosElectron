const Gasto = require('../models/Gasto')
const Venda = require('../models/Venda')

const DashboardResumoService = {
    resumo(dataInicio = null, dataFim = null) {
        const hoje = new Date()
        const fim = dataFim ?? hoje.toISOString().split('T')[0]
        const trintaDiasAtras = new Date()
        trintaDiasAtras.setDate(hoje.getDate() - 30)
        const inicio = dataInicio ?? trintaDiasAtras.toISOString().split('T')[0]
        
        const listaVendas = Venda.buscarPorPeriodo(inicio, fim)
        const somaVendas = Venda.somarVendasPorPeriodo(inicio, fim)
        const listaGastos = Gasto.buscarPorPeriodo(inicio, fim)
        const somaGastos = Gasto.somarGastosPorPeriodo(inicio, fim)
        const saldo = +(somaVendas.total ?? 0) - +(somaGastos.total ?? 0)
        const fixoVariavelSoma = Gasto.somarGastosFixosVariaveisPorPeriodo(inicio,fim)
        const vendaUltimoAno = Venda.buscaVendaUltimoAno()

        return {
            listaVendas,
            somaVendas,
            listaGastos,
            somaGastos,
            saldo,
            fixoVariavelSoma,
            vendaUltimoAno
        }

        
    },

    lancamentosDoDiaUsuario(nomeUsuario) {
        const hoje = new Date().toISOString().split('T')[0]
        const listaVendas = Venda.buscarPorPeriodoEUsuario(hoje, hoje, nomeUsuario)
        const listaGastos = Gasto.buscarPorPeriodoEUsuario(hoje, hoje, nomeUsuario)

        return {
            listaVendas,
            listaGastos
        }
    }

}

module.exports = DashboardResumoService