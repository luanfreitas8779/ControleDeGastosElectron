const Logs = require('../models/Log')
const { formatarDataIsoRondonia } = require('../helpers/datahelper')

const LogsService = {
    buscarPorPeriodo(dataInicio = null, dataFim = null) {
        const hoje = new Date()
        const fim = dataFim ?? formatarDataIsoRondonia(hoje)
        const trintaDiasAtras = new Date()
        trintaDiasAtras.setDate(hoje.getDate() - 30)

        const inicio = dataInicio ?? formatarDataIsoRondonia(trintaDiasAtras)
        return Logs.buscarPorPeriodo(inicio, fim)
    },
}

module.exports = LogsService