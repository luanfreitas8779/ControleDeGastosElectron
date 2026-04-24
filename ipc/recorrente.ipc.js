const ipcWrapper = require('./ipcWrapper')
const authMiddleware = require('../middlewares/auth.middleware')
const RecorrenteController = require('../controllers/CategoriaController')

//ipcWrapper('gasto:criar', [authMiddleware], GastoController.criar)

ipcWrapper('recorrente:criar', [], RecorrenteController.criar)
ipcWrapper('recorrente:deletar', [], RecorrenteController.deletar)
ipcWrapper('recorrente:listar', [], RecorrenteController.listar) 