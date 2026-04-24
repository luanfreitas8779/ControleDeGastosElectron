const FUSO_RONDONIA = 'America/Porto_Velho'

function extrairPartesNoFuso(data = new Date(), timeZone = FUSO_RONDONIA) {
    const formatador = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    })

    const partes = formatador.formatToParts(data)
    const valores = {}

    partes.forEach(({ type, value }) => {
        if (type !== 'literal') {
            valores[type] = value
        }
    })

    return valores
}

function formatarDataIsoRondonia(data = new Date()) {
    const { year, month, day } = extrairPartesNoFuso(data)
    return `${year}-${month}-${day}`
}

function parseTimestampSqliteUtc(valor) {
    if (!valor) {
        return null
    }

    if (valor instanceof Date) {
        return valor
    }

    if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(valor)) {
        return new Date(valor.replace(' ', 'T') + 'Z')
    }

    const data = new Date(valor)
    return Number.isNaN(data.getTime()) ? null : data
}

function formatarDataPtBrRondonia(valor) {
    const data = parseTimestampSqliteUtc(valor)
    if (!data) {
        return null
    }

    return data.toLocaleDateString('pt-BR', { timeZone: FUSO_RONDONIA })
}

module.exports = {
    FUSO_RONDONIA,
    formatarDataIsoRondonia,
    formatarDataPtBrRondonia,
    parseTimestampSqliteUtc
}
