const db = require('../database/connection')

//Lógica para inserir uma categoria no banco de dados
const Categoria = {

    //Lógica para inserir uma categoria no banco de dados
    criar({nome}) {
        const stmt = db.prepare(`
            INSERT INTO categorias (nome)
            VALUES (?)
        `)
        const result = stmt.run(nome)
        return result.lastInsertRowid
    },

    //Lógica para deletar uma categoria no banco de dados
    deletar(id) {
        const stmt = db.prepare(`
            DELETE FROM categorias
            WHERE id = ?
        `)
        stmt.run(id)
        return stmt.changes
    },
    listar() {
        const stmt = db.prepare(`
            SELECT * FROM categorias
            ORDER BY nome ASC
        `)
        return stmt.all()
    }
}

module.exports = Categoria