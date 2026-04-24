const Recorrente = require('../models/Recorrente')

const RecorrenteService = {
    criar({nome_gasto, valor, inicio, fim}) {
        
        //Verificar se todos os campos foram preenchidos
        if (!dados.nome_gasto) {
            throw new Error('Nome do gasto é obrigatório')
    }
        if (!dados.valor) {
            throw new Error('Valor do gasto é obrigatório')
        }
        if (!dados.inicio) {
            throw new Error('Data de início do gasto é obrigatória')
        }
        if (!dados.fim) {
            throw new Error('Data de fim do gasto é obrigatória')
        }
        //Fim da verificação dos campos preenchidos

        //Criar o gasto recorrente no banco de dados
        const id = Recorrente.criar({nome_gasto, valor, inicio, fim})
        return { mensagem: "Gasto recorrente criado com sucesso", id, nome_gasto, valor, inicio, fim }
    },

    //Lógica para deletar um gasto recorrente
    deletar({ id}) {
        if (!id) {
            throw new Error('ID do gasto recorrente é obrigatório para edição')
        }
        const id =Recorrente.deletar(id)
        if(id === 0) {
            throw new Error('Nenhum gasto recorrente encontrado com o ID fornecido')
        }
        return { mensagem: "Gasto recorrente deletado com sucesso", id }
    },

    //Lógica para listar os gastos recorrentes
    listar(filtro) {
        if (filtro === 'ativos') {
            return Recorrente.listarAtivos()
        }if(filtro === 'todos') {
        return Recorrente.listarTodos()
        }
        throw new Error('Filtro inválido.')
    }
}

module.exports = RecorrenteService