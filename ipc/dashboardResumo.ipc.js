const ipcWrapper = require('./ipcWrapper')
const authMiddleware = require('../middlewares/auth.middleware')
const DashboardResumoController = require('../controllers/DashboardReusmoController')
const sessao = require('../session')

function isAdmin(dados) {
    const usuario = sessao.getSessao()
    if(usuario.admin === 1) {
        return dados
    }else {
        throw new Error('Você não tem permissão para visualizar esta tela!')
    }
}

ipcWrapper('dashboardResumo:resumo', [isAdmin], DashboardResumoController.resumo)
ipcWrapper('dashboardResumo:lancamentosDoDiaUsuario', [authMiddleware], DashboardResumoController.lancamentosDoDiaUsuario)