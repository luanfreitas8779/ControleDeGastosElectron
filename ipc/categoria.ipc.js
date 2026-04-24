const ipcWrapper = require('./ipcWrapper')
const authMiddleware = require('../middlewares/auth.middleware')
const CategoriaController = require('../controllers/CategoriaController')



ipcWrapper('categoria:criar', [], CategoriaController.criar)
ipcWrapper('categoria:deletar', [], CategoriaController.deletar)
ipcWrapper('categoria:listar', [], CategoriaController.listar)