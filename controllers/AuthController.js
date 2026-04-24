const AuthService = require('../services/AuthService')

// Importa o setter e getter da sessão (separado do main.js)
// para evitar dependência circular entre main <-> controllers.
const { getSessao, setSessao } = require('../session')

const AuthController = {

    login(dados) {
        try {
            // Chama o service que valida as credenciais
            const usuario = AuthService.login(dados)

            // Se chegou aqui, as credenciais são válidas.
            // Salva o usuário na variável de sessão do main process.
            setSessao(usuario)

            return { sucesso: true, dados: usuario }

        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    logout() {
        try {
            // Limpa a sessão — próxima verificação vai retornar null
            setSessao(null)
            return { sucesso: true }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    buscarSessao() {
        try {
            // Retorna o usuário atualmente logado, ou null se não houver sessão
            const usuario = getSessao()
            return { sucesso: true, dados: usuario }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}

module.exports = AuthController