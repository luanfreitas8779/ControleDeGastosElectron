const db = require('../database/connection')

const Logs = {

    // Registra uma entrada no log.
    // Recebe um objeto com todos os campos necessários.
    registrar({ tabela, id_registro, nome_user, dados_antes, dados_depois }) {

        const stmt = db.prepare(`
            INSERT INTO logs (tabela, id_registro, nome_user, dados_antes, dados_depois)
            VALUES (?, ?, ?, ?, ?)
        `)

        // JSON.stringify converte o objeto para texto porque o SQLite
        // não tem tipo objeto — na hora de ler, usamos JSON.parse para converter de volta
        stmt.run(
            tabela,
            id_registro,
            nome_user,
            JSON.stringify(dados_antes),
            JSON.stringify(dados_depois)
        )
    },

    // Busca todos os logs ordenados do mais recente para o mais antigo.
    // Usado na tela de visualização de logs.
    buscarPorPeriodo(dataInicio, dataFim) {
        const stmt = db.prepare(`
                SELECT * FROM logs 
            WHERE date(datetime(data_hora, '-4 hours')) BETWEEN date(?) AND date(?)
            ORDER BY data_hora DESC
            `)
        const logs = stmt.all(dataInicio, dataFim)

        // Converte os campos dados_antes e dados_depois de volta para objeto
        // porque foram salvos como string JSON no banco
        return logs.map(log => ({
            ...log,
            dados_antes: JSON.parse(log.dados_antes),
            dados_depois: JSON.parse(log.dados_depois)
        }))
    }
}

module.exports = Logs