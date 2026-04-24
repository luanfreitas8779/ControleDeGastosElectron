// ipc/usuario.ipc.js
const ipcWrapper = require('./ipcWrapper')
const UsuarioController = require('../controllers/UsuarioController')
const authMiddleware = require('../middlewares/auth.middleware')
const sessao = require('../session')

function isAdmin(dados) {
    const usuario = sessao.getSessao()
    if(usuario.admin === 1) {
        return dados
    }else {
        throw new Error('Você não tem permissão para isso')
    }
}

ipcWrapper('usuario:criar', [authMiddleware, isAdmin], UsuarioController.criar)
ipcWrapper('usuario:listar', [authMiddleware, isAdmin], UsuarioController.listar)
ipcWrapper('usuario:desativar', [authMiddleware, isAdmin], UsuarioController.desativar)
ipcWrapper('usuario:alterarSenha', [authMiddleware, isAdmin], UsuarioController.alterarSenha)
ipcWrapper('usuario:alterarPermissao', [authMiddleware, isAdmin], UsuarioController.alterarPermissao)