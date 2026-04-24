// middlewares/auth.middleware.js
const sessao = require('../session') // onde você guarda o usuário logado

function authMiddleware(dados) {
    const usuario = sessao.getSessao()

    if (!usuario) {
        throw new Error('Não autorizado, faça login novamente!')
    }

    // injeta dados de sessão para uso em controllers/services
    return { ...dados, usuario_id: usuario.id, usuario_logado: usuario }
}

module.exports = authMiddleware