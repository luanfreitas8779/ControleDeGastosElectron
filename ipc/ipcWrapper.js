// ipc/ipcWrapper.js
const { ipcMain } = require('electron')

function ipcWrapper(canal, middlewares, handler) {
    ipcMain.handle(canal, async (event, dados) => {
        try {
            // executa cada middleware em sequência
            let dadosProcessados = dados
            for (const middleware of middlewares) {
                dadosProcessados = middleware(dadosProcessados)
            }

            // chama o handler final (controller)
            return handler(dadosProcessados)

        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    })
}

module.exports = ipcWrapper