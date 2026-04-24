const ipcWrapper = require('./ipcWrapper')
const AuthController = require('../controllers/AuthController')

// Registra os canais IPC de autenticação
ipcWrapper('auth:login', [], AuthController.login)
ipcWrapper('auth:logout', [], AuthController.logout)
ipcWrapper('auth:sessao', [], AuthController.buscarSessao)