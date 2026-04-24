// Middleware para criar logs de alterações em gastos
function criarLogMiddleware(buscarRegistroAtual, registrarLog, campoId) {
    return function logMiddleware(dados) {
        const registroAtual = buscarRegistroAtual(dados.id)

        if (registroAtual) {
            registrarLog({
                [campoId]: dados.id,
                valor_anterior: JSON.stringify(registroAtual),
                valor_atual: JSON.stringify(dados),
                nome_user: dados.nome_user || 'Desconhecido'
            })
        }

        return dados
    }
}

module.exports = criarLogMiddleware