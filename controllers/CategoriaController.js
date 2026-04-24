const CategoriaService = require('../services/CategoriaService')

//Controller para lidar com as requisições relacionadas às categorias
const CategoriaController = {

    //Lógica para criar uma categoria
    criar(dados) {
        try {
            const categoria = CategoriaService.criar(dados)
            return { sucesso: true, dados: categoria }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },

    //Lógica para deletar uma categoria
    deletar(dados) {
        try {
            CategoriaService.deletar(dados)
            return { sucesso: true, mensagem: 'Categoria excluída com sucesso' }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    },
    listar() {
        try {
            const categorias = CategoriaService.listar()
            return { sucesso: true, dados: categorias }
        } catch (error) {
            return { sucesso: false, mensagem: error.message }
        }
    }
}


module.exports = CategoriaController