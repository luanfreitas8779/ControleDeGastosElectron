const db = require('../database/connection')


const Gasto = {
    //Encontrar um gasto por ID para log de alterações
    buscarPorId(id) {
    return db.prepare('SELECT * FROM gastos WHERE id = ?').get(id)
},

    //Lógica para inserir um gasto no banco de dados
    criar({dataGasto, valorGasto, descricaoGasto, fixoVariavel, categoria, nome_user}) {
        const stmt = db.prepare(`
            INSERT INTO gastos (id_categoria, descricao, valor, data, nome_user, fixo_variavel)
            VALUES (?, ?, ?, ?, ?, ?)
        `)
        const result = stmt.run(categoria, descricaoGasto, valorGasto, dataGasto, nome_user, fixoVariavel)
        return result.lastInsertRowid
    },
    
    //Lógica para editar um gasto no banco de dados
    editar({id, descricao, valor, data, fixoVariavel}) {
        const stmt = db.prepare(`
            UPDATE gastos
            SET descricao = ?, valor = ?, data = ?, fixo_variavel = ?
            WHERE id = ?
        `)
        stmt.run(descricao, valor, data, fixoVariavel, id)
        return stmt.changes
    },

    //Lógica para deletar um gasto no banco de dados
    deletar(id) {
        const stmt = db.prepare(`
            DELETE FROM gastos
            WHERE id = ?
        `)
        stmt.run(id)
        return stmt.changes
    },

    //Lógica para listar os gastos por período
    buscarPorPeriodo(dataInicio, dataFim) {
        const stmt = db.prepare(`
        SELECT * FROM gastos 
        WHERE data BETWEEN ? AND ?
        ORDER BY data_criacao ASC`)
        return stmt.all(dataInicio, dataFim)
    },

    buscarPorPeriodoEUsuario(dataInicio, dataFim, nomeUser) {
        const stmt = db.prepare(`
        SELECT * FROM gastos
        WHERE data BETWEEN ? AND ?
        AND nome_user = ?
        ORDER BY data_criacao ASC`)
        return stmt.all(dataInicio, dataFim, nomeUser)
    },
    //Lógica para somar os gastos por período
    somarGastosPorPeriodo(dataInicio, dataFim) {
        const stmt = db.prepare(`
            SELECT SUM(valor) AS total
            FROM gastos
            WHERE data BETWEEN ? AND ?
        `)
        return stmt.get(dataInicio, dataFim)
    },
    //Lógica para somar os gastos por período separado em fixo e variavel
    somarGastosFixosVariaveisPorPeriodo(dataInicio, dataFim) {
        const stmt = db.prepare(`
            SELECT fixo_variavel, 
            ROUND(SUM(valor), 2) AS total
            FROM gastos
            WHERE data BETWEEN ? AND ?
            GROUP BY fixo_variavel;
            `)
        return stmt.all(dataInicio, dataFim)
    },

    buscaGastoUltimoAno(dados) {
        const stmt = db.prepare(`
            SELECT 
            strftime('%Y-%m', data) AS mes_ano, 
            SUM(valor) AS total
            FROM gastos
            WHERE data >= date('now', 'start of month', '-12 months') 
            AND data < date('now', 'start of month')
            GROUP BY mes_ano
            ORDER BY mes_ano ASC;`)
            return stmt.all()
    }
}

module.exports = Gasto
