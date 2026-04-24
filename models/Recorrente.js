const db = require('../database/connection')

//lógica para inserir um gasto recorrente no banco de dados
const Recorrente = {

    //Lógica para inserir um gasto recorrente no banco de dados
    criar({nome_gasto, valor, inicio, fim}) {

        const stmt = db.prepare(`
            INSERT INTO recorrentes (nome_gasto, valor, inicio, fim)
            VALUES (?, ?, ?, ?)`)
        
        stmt.run([nome_gasto, valor, inicio, fim])
        return result.lastInsertRowid
        
    },

    //Lógica para editar um gasto recorrente no banco de dados
    editar({ id, nome_gasto, valor, inicio, fim }) {
        const stmt = db.prepare(`
            UPDATE recorrentes
            SET nome_gasto = ?, valor = ?, inicio = ?, fim = ?
            WHERE id = ?
        `)
        stmt.run(nome_gasto, valor, inicio, fim, id)
        return stmt.changes
    },

    //Lógica para listar todos os gastos ativos na data atual
    listarAtivos() {
        const stmt = db.prepare(`
            SELECT * FROM recorrentes
            WHERE date('now') BETWEEN inicio AND fim
            ORDER BY inicio ASC
        `)
        return stmt.all()
    },

    //Lógica para listar todos os gastos recorrentes registrados no BD
    listarTodos() {
        const stmt = db.prepare(`
            SELECT * FROM recorrentes
            ORDER BY inicio ASC
        `)
        return stmt.all()}
}

module.exports = Recorrente
