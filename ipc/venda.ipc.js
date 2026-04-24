const VendaController = require('../controllers/VendaController')
const ipcWrapper = require('./ipcWrapper')
const authMiddleware = require('../middlewares/auth.middleware')
const criarLogMiddleware = require('../middlewares/log.middleware')
const Venda = require('../models/Venda')
const sessao = require('../session')

function isAdmin(dados) {
    const usuario = sessao.getSessao()
    if(usuario.admin === 1) {
        return dados
    }else {
        throw new Error('Você não tem permissão para isso')
    }
}

ipcWrapper('venda:criar', [authMiddleware], VendaController.criar)
ipcWrapper('venda:editar', [authMiddleware, isAdmin], VendaController.editar)
ipcWrapper('venda:deletar', [authMiddleware, isAdmin], VendaController.deletar)
ipcWrapper('venda:buscarPorPeriodo', [], VendaController.buscarPorPeriodo)
ipcWrapper('venda:somarVendasPorPeriodo', [], VendaController.somarVendasPorPeriodo)