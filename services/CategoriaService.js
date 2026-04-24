const Categoria = (require('../models/Categoria'))

const CategoriaService = {
    criar(dados) {
        if (!dados.nome) {
            throw new Error('Nome da categoria é obrigatório')
        }else {
            // Tratamento de erro para nome duplicado
            try {
            const id = Categoria.criar(dados)
            return { mensagem: "Categoria criada com sucesso", id, nome: dados.nome }
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Já existe uma categoria com esse nome')
            }
            throw error
        }
    }
        },

    //Lógica para deletar uma categoria
    deletar(dados) {
        if (!dados.id) {
            throw new Error('ID da categoria é obrigatório para exclusão')
        }
        const id = Categoria.deletar(dados.id)
        if(id === 0) {
            throw new Error('Nenhuma categoria encontrada com o ID fornecido')
        }
        return { mensagem: "Categoria deletada com sucesso", id }
    },

    //Lógica para listar todas as categorias
    listar() {
        const categorias = Categoria.listar()
        return categorias
    }
}

module.exports = CategoriaService