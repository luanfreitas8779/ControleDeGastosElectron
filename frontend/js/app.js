// Ao iniciar o app, verifica se já há sessão ativa
const nomeDoUsuarioLogado = document.getElementById('logado')

function definirLinkAtivo(pagina) {
    document.querySelectorAll('[data-page]').forEach(link => link.classList.remove('ativo'))
    const linkDaPagina = document.querySelector(`[data-page="${pagina}"]`)
    if (linkDaPagina) {
        linkDaPagina.classList.add('ativo')
    }
}


async function navegarPara(pagina) {
    const resposta = await fetch(`pages/${pagina}.html`)
    const html = await resposta.text()
    document.getElementById('conteudo').innerHTML = html
    await carregarScript(`js/pages/${pagina}.js`)
}

function carregarScript(src) {
    return new Promise((resolve) => {
        limparScriptAnterior()

        const script = document.createElement('script')
        script.src = src + '?t=' + Date.now()
        script.id = 'scriptAtivo'
        script.onload = resolve

        document.body.appendChild(script)
    })
}

function limparScriptAnterior() {
    const scriptAnterior = document.getElementById('scriptAtivo')
    if (scriptAnterior) {
        scriptAnterior.remove()
    }
}

document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault()
        const linkClicado = e.target.closest('[data-page]')
        if (!linkClicado) return
        const pagina = linkClicado.dataset.page

        document.querySelectorAll('[data-page]').forEach(l => l.classList.remove('ativo'))
        linkClicado.classList.add('ativo')

        navegarPara(pagina)
    })
})

document.getElementById('btnLogout').addEventListener('click', async () => {
    await window.api.auth.logout()
    window.location.href = 'login.html'
})

document.addEventListener('DOMContentLoaded', () => {
    carregarPaginaInicial()
})

async function logout () {
    const response = await window.api.auth.logout()
    if (response.sucesso) {
        window.location.href = 'login.html'
    }
}

async function nomeUsuarioLogado () {
    const usuarioLogado = await window.api.auth.buscarSessao()
    nomeDoUsuarioLogado.textContent = usuarioLogado.dados.login
    
}

async function carregarPaginaInicial() {
    const usuarioLogado = await window.api.auth.buscarSessao()
    const usuarioEhAdmin = !!usuarioLogado?.dados?.admin
    const paginaInicial = usuarioEhAdmin ? 'dashboard' : 'lancamentos'
    definirLinkAtivo(paginaInicial)
    await navegarPara(paginaInicial)
}

nomeUsuarioLogado()