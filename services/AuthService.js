const bcrypt = require('bcryptjs')
const Usuario = require('../models/Usuario')

const AuthService = {

    login({ login, senha }) {

        // Verifica se os campos foram enviados
        if (!login || !senha) {
            throw new Error('Login e senha são obrigatórios')
        }

        // Busca o usuário no banco pelo login
        const usuario = Usuario.buscarPorLogin(login)

        // Se não encontrou nenhum usuário com esse login, nega o acesso.
        // A mensagem é genérica de propósito — não informamos se o login
        // não existe ou se a senha está errada, por segurança.
        if (!usuario) {
            throw new Error('Login ou senha inválidos')
        }

        // Verifica se o usuário está ativo
        if (!usuario.ativo) {
            throw new Error('Usuário inativo. Contate o administrador.')
        }

        // Compara a senha digitada com o hash salvo no banco.
        // O bcrypt faz isso de forma segura — nunca descriptografa o hash,
        // ele recalcula e compara os resultados.
        const senhaCorreta = bcrypt.compareSync(senha, usuario.senha_hash)

        if (!senhaCorreta) {
            throw new Error('Login ou senha inválidos')
        }

        // Retorna os dados do usuário SEM o hash da senha —
        // nunca devolvemos dados sensíveis para o front
        return {
            id: usuario.id,
            login: usuario.login,
            ativo: usuario.ativo,
            admin: usuario.admin
        }
    }
}

module.exports = AuthService