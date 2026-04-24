let usuarioLogado = null

const sessao = {
    setUsuario(usuario) {
        usuarioLogado = usuario
    },

    getUsuario() {
        return usuarioLogado
    },

    encerrar() {
        usuarioLogado = null
    }
}

module.exports = sessao