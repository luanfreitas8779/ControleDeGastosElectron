const ipcWrapper = require('./ipcWrapper')
const authMiddleware = require('../middlewares/auth.middleware')
const GastoController = require('../controllers/GastoController')
const criarLogMiddleware = require('../middlewares/log.middleware')
const Gasto = require('../models/Gasto')
const sessao = require('../session')

function isAdmin(dados) {
    const usuario = sessao.getSessao()
    if(usuario.admin === 1) {
        return dados
    }else {
        throw new Error('Você não tem permissão para visualizar esta tela!')
    }
}


ipcWrapper('gasto:criar', [authMiddleware], GastoController.criar)
ipcWrapper('gasto:editar', [authMiddleware, isAdmin], GastoController.editar)
ipcWrapper('gasto:deletar', [authMiddleware, isAdmin], GastoController.deletar)
ipcWrapper('gasto:buscarPorPeriodo', [isAdmin], GastoController.buscarPorPeriodo),
ipcWrapper('gasto:somarGastosPorPeriodo', [isAdmin], GastoController.somarGastosPorPeriodo)