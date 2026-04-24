// models/Usuario.js
const db = require('../database/connection')

const Usuario = {
    criar({ login, senha_hash }) {
        const stmt = db.prepare(`
            INSERT INTO usuarios (login, senha_hash)
            VALUES (?, ?)
        `)
        const result = stmt.run(login, senha_hash)
        return result.lastInsertRowid
    },
    //Lógica para listar todos os usuários cadastrados e ativos
    listar() {
        const stmt = db.prepare(`
            SELECT id, login, ativo, admin
            FROM usuarios
            WHERE ativo = 1
            ORDER BY login ASC
        `)
        return stmt.all()
    },

    //Lógica para desativar um usuário
    desativar(id) {
        const stmt = db.prepare(`
            UPDATE usuarios
            SET ativo = 0
            WHERE id = ?
        `)
        stmt.run(id)
        return stmt.changes
    },

    buscarPorLogin(login) {
        const stmt = db.prepare(`
            SELECT * FROM usuarios WHERE login = ?
        `)
        // stmt.get retorna o primeiro resultado encontrado,
        // ou undefined se não encontrar nenhum
        return stmt.get(login)
    },

    buscarPorId(id) {
        const stmt = db.prepare(`
            SELECT id, login, ativo, admin
            FROM usuarios
            WHERE id = ?
        `)
        return stmt.get(id)
    },

    contarUsuariosAtivos() {
        const stmt = db.prepare(`
            SELECT COUNT(*) AS total
            FROM usuarios
            WHERE ativo = 1
        `)
        const resultado = stmt.get()
        return resultado.total
    },

    contarAdminsAtivos() {
        const stmt = db.prepare(`
            SELECT COUNT(*) AS total
            FROM usuarios
            WHERE ativo = 1 AND admin = 1
        `)
        const resultado = stmt.get()
        return resultado.total
    },

    alterarSenha({ id, senha_hash }) {
        const stmt = db.prepare(`
            UPDATE usuarios
            SET senha_hash = ?
            WHERE id = ? AND ativo = 1
        `)
        const resultado = stmt.run(senha_hash, id)
        return resultado.changes
    },

    alterarPermissao({ id, admin }) {
        const stmt = db.prepare(`
            UPDATE usuarios
            SET admin = ?
            WHERE id = ? AND ativo = 1
        `)
        const resultado = stmt.run(admin, id)
        return resultado.changes
    }
}

module.exports = Usuario