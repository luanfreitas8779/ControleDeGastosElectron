const db = require('../database/connection')

//Lógica para inserir uma venda no banco de dados
const Venda = {
    criar({valorVenda, dataVenda, nome_user}) {
        const stmt = db.prepare(`
            INSERT INTO vendas (valor, data, nome_user)
            VALUES (?, ?, ?)`)

        const result = stmt.run(valorVenda, dataVenda, nome_user)
        return result.lastInsertRowid
    },

    buscarDuplicata({ valorVenda, dataVenda }) {
        const stmt = db.prepare(`
            SELECT id FROM vendas
            WHERE valor = ? AND data = ?
        `)
        return stmt.get(valorVenda, dataVenda)
    },

    //Lógica para editar uma venda no banco de dados
    editar({ id, valor, data, nome_user }) {
        const stmt = db.prepare(`
            UPDATE vendas
            SET valor = ?, data = ?, nome_user = ?
            WHERE id = ?
        `)
        stmt.run(valor, data, nome_user, id)
        return stmt.changes
    },

    //Lógica para deletar uma venda no banco de dados
    deletar(id) {
        const stmt = db.prepare(`
            DELETE FROM vendas
            WHERE id = ?
        `)
        stmt.run(id)
        return stmt.changes
    },

    buscarPorPeriodo(data_inicio, data_fim) {
        const stmt = db.prepare(`
            SELECT * FROM vendas 
        WHERE data BETWEEN ? AND ?
        ORDER BY data_criacao ASC
        `)
        return stmt.all(data_inicio, data_fim)
    },

    buscarPorPeriodoEUsuario(dataInicio, dataFim, nomeUser) {
        const stmt = db.prepare(`
            SELECT * FROM vendas
            WHERE data BETWEEN ? AND ?
            AND nome_user = ?
            ORDER BY data_criacao ASC
        `)
        return stmt.all(dataInicio, dataFim, nomeUser)
    },

    somarVendasPorPeriodo(data_inicio, data_fim) {
        const stmt = db.prepare(`
            SELECT SUM(valor) AS total
            FROM vendas
            WHERE data BETWEEN ? AND ?
        `)
        return stmt.get(data_inicio, data_fim)
    },

    buscaVendaUltimoAno(dados) {
        const stmt = db.prepare(`
            SELECT 
            strftime('%Y-%m', data) AS mes_ano, 
            SUM(valor) AS total
            FROM vendas
            WHERE data >= date('now', 'start of month', '-12 months') 
            AND data < date('now', 'start of month')
            GROUP BY mes_ano
            ORDER BY mes_ano ASC;`)
            return stmt.all()
    },

    buscarPorId(dados) {
        const stmt = db.prepare(`
            SELECT * 
            FROM vendas
            WHERE id = ?
            `)
        return stmt.get(dados.id)
    }
}


module.exports = Venda