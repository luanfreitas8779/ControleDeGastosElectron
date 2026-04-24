const Venda = require('../models/Venda')
const Log = require('../models/Log')

const VendaService = {

    //Lógica para criar uma venda
    criar(dados) {
        if(!dados.valorVenda || !dados.dataVenda || !dados.nome_user) {
            throw new Error('Valor, data e nome do usuário são obrigatórios para criar uma venda')
        }
        if(dados.valorVenda <= 0) {
            throw new Error('Valor da venda deve ser maior que zero')
        }

        const duplicata = Venda.buscarDuplicata(dados)
        if (duplicata) {
        throw new Error('Já existe uma venda com este valor e data registrados')
    }

        try {
            const id = Venda.criar(dados)
            return { mensagem: "Venda criada com sucesso", id, ...dados }
        } catch (error) {
            throw new Error('Erro ao criar venda')
        }
    },
    
    //Lógica para editar uma venda
    editar(dados) {

        if (!dados.id || !dados.data || !dados.valor || !dados.nome_user) {
            throw new Error('Todos os dados são obrigatórios!')
        }
        if(dados.valor < 0) {
            throw new Error("O valor não pode ser menor que 0!")
        }

        // Busca os dados atuais da venda ANTES de editar
        const dadosAntigos = Venda.buscarPorId({ id: dados.id })
        if (!dadosAntigos) {
            throw new Error('Nenhuma venda encontrada com o ID fornecido')
        }

        try {
            // Edita o registro no banco com os novos dados
            const id = Venda.editar(dados)

            // Registra o log com o antes e depois da edição
            Log.registrar({
                tabela: 'venda',
                id_registro: dados.id,
                nome_user: dados.nome_user, // quem fez a alteração, vindo do front
                dados_antes: dadosAntigos,  // objeto com os dados originais
                dados_depois: dados         // objeto com os dados novos
            })

            return { mensagem: 'Venda editada com sucesso', id, ...dados }

        } catch (error) {
            throw new Error('Erro ao editar venda: ' + error.message)
        }
    },
   
   
    //Lógica para deletar uma venda
    deletar(dados) {
        if(!dados.id) {
            throw new Error('ID da venda é obrigatório para exclusão')
        }
        try {
            // Busca os dados ANTES de excluir para registrar no log
            const dadosAntigos = Venda.buscarPorId({ id: dados.id })
            if (!dadosAntigos) {
                throw new Error('Nenhuma venda encontrada com o ID fornecido')
            }

            Venda.deletar(dados.id)

            // Registra o log com o antes da exclusão. Após excluir, não existe "depois".
            Log.registrar({
                tabela: 'venda',
                id_registro: dados.id,
                nome_user: dados.nome_user || 'Desconhecido',
                dados_antes: dadosAntigos,
                dados_depois: {}
            })

            return { mensagem: "Venda deletada com sucesso", id: dados.id }
        } catch (error) {
            throw new Error('Erro ao deletar venda')
        }
    },

    //Lógica para listar todas as vendas por período
    buscarPorPeriodo(dataInicio = null, dataFim = null) {
        
        const hoje = new Date()
        const fim = dataFim ?? hoje.toISOString().split('T')[0]
        const trintaDiasAtras = new Date()
        trintaDiasAtras.setDate(hoje.getDate() - 30)
        hoje.setDate(trintaDiasAtras)
        
        const inicio = dataInicio ?? trintaDiasAtras.toISOString().split('T')[0]
        return Venda.buscarPorPeriodo(inicio, fim)
    },

    somarVendasPorPeriodo(dataInicio = null, dataFim = null) {
        
        const hoje = new Date()
        const fim = dataFim ?? hoje.toISOString().split('T')[0]
        const trintaDiasAtras = new Date()
        trintaDiasAtras.setDate(hoje.getDate() - 30)
        hoje.setDate(trintaDiasAtras)
        
        const inicio = dataInicio ?? trintaDiasAtras.toISOString().split('T')[0]
        return Venda.somarVendasPorPeriodo(inicio, fim)
    }
    
}

module.exports = VendaService