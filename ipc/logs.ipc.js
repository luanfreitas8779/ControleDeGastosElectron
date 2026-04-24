const ipcWrapper = require('./ipcWrapper')
const authMiddleware = require('../middlewares/auth.middleware')
const LogsController = require('../controllers/LogsController')
const sessao = require('../session')

function isAdmin(dados) {
    const usuario = sessao.getSessao()
    if(usuario.admin === 1) {
        return dados
    }else {
        throw new Error('Você não tem permissão para visualizar esta tela!')
    }
}

ipcWrapper('logs:buscarPorPeriodo', [authMiddleware, isAdmin], LogsController.buscarPorPeriodo)