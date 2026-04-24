const RecorrenteService = require('../services/RecorrenteService')


//Controller para lidar com as requisições relacionadas aos gastos recorrentes
const RecorrenteController = {

    //Lógica para criar um gasto recorrente
    criar(dados) {
        try {
            const recorrente = RecorrenteService.criar(dados)
            return { sucesso: true, dados: recorrente }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    //Lógica para deletar um gasto recorrente
    deletar(dados) {
        try {
            const recorrente = RecorrenteService.deletar(dados)
            return { sucesso:true, dados: recorrente }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    //Lógica para listar os gastos recorrentes
    listar(dados) {
        try {
            const recorrentes = RecorrenteService.listar(dados?.filtro)
            return { sucesso: true, dados: recorrentes }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}

module.exports = RecorrenteController