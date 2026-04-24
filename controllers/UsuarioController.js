// controllers/UsuarioController.js
const UsuarioService = require('../services/UsuarioService')

const UsuarioController = {
    async criar(dados) {
        try {
            const usuario = await UsuarioService.criar(dados)
            return { sucesso: true, dados: usuario }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    //Lógica para listar todos os usuários cadastrados e ativos
    listar() {
        try {
            const usuarios = UsuarioService.listar()
            return { sucesso: true, dados: usuarios }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    //Lógica para desativar um usuário
    desativar(dados) {
        try {
            const resultado = UsuarioService.desativar(dados)
            return { sucesso: true, dados: resultado }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    async alterarSenha(dados) {
        try {
            const resultado = await UsuarioService.alterarSenha(dados)
            return { sucesso: true, dados: resultado }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    alterarPermissao(dados) {
        try {
            const resultado = UsuarioService.alterarPermissao(dados)
            return { sucesso: true, dados: resultado }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}

module.exports = UsuarioController