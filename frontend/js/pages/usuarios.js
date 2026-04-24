(function () {
    const btnNovoUsuario = document.getElementById('btn-novo-usuario')
    const tbodyUsuarios = document.getElementById('tabela-usuarios-body')

    const modalNovoUsuario = document.getElementById('modal-novo-usuario')
    const modalAlterarSenha = document.getElementById('modal-alterar-senha')
    const modalConfirmarExclusao = document.getElementById('modal-confirmar-exclusao')
    const modalConfirmarPermissao = document.getElementById('modal-confirmar-permissao')

    const inputNovologin = document.getElementById('novo-usuario-login')
    const inputNovoSenha = document.getElementById('novo-usuario-senha')
    const inputNovoConfirmarSenha = document.getElementById('novo-usuario-confirmar-senha')

    const inputAlterarSenha = document.getElementById('alterar-usuario-senha')
    const inputAlterarConfirmarSenha = document.getElementById('alterar-usuario-confirmar-senha')
    const textoUsuarioSelecionadoSenha = document.getElementById('texto-usuario-selecionado-senha')
    const textoConfirmacaoExclusao = document.getElementById('texto-confirmacao-exclusao')
    const textoConfirmacaoPermissao = document.getElementById('texto-confirmacao-permissao')

    const btnCancelarUsuario = document.getElementById('btn-cancelar-usuario')
    const btnSalvarUsuario = document.getElementById('btn-salvar-usuario')
    const btnCancelarSenha = document.getElementById('btn-cancelar-senha')
    const btnSalvarSenha = document.getElementById('btn-salvar-senha')
    const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao')
    const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao')
    const btnCancelarPermissao = document.getElementById('btn-cancelar-permissao')
    const btnConfirmarPermissao = document.getElementById('btn-confirmar-permissao')

    let usuarioSelecionado = null
    let usuarioEhAdmin = true

    function mostrarToast(mensagem, tipo = 'sucesso') {
        const toast = document.createElement('div')
        toast.className = `toast ${tipo === 'erro' ? 'toast-erro' : 'toast-sucesso'}`
        toast.textContent = mensagem
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 2800)
    }

    function mostrarAvisoSemPermissao(mensagem = 'Você não tem permissão para visualizar esta tela.') {
        if (document.querySelector('#aviso-sem-permissao-usuarios')) return
        const aviso = document.createElement('div')
        aviso.id = 'aviso-sem-permissao-usuarios'
        aviso.textContent = mensagem
        aviso.style.margin = '12px 0'
        aviso.style.padding = '12px'
        aviso.style.borderRadius = '8px'
        aviso.style.backgroundColor = '#fff3cd'
        aviso.style.border = '1px solid #ffe69c'
        aviso.style.color = '#664d03'
        document.querySelector('.usuarios')?.prepend(aviso)
    }

    function configurarTelaSemPermissao() {
        btnNovoUsuario.disabled = true
        btnNovoUsuario.textContent = 'Acesso restrito'
        const colunaAcoes = document.querySelector('.tabela-usuarios thead th:last-child')
        if (colunaAcoes) colunaAcoes.style.display = 'none'
    }

    function abrirModal(modal) {
        modal.classList.add('ativo')
    }

    function fecharModal(modal) {
        modal.classList.remove('ativo')
    }

    function limparCamposNovoUsuario() {
        inputNovologin.value = ''
        inputNovoSenha.value = ''
        inputNovoConfirmarSenha.value = ''
    }

    function limparCamposAlterarSenha() {
        inputAlterarSenha.value = ''
        inputAlterarConfirmarSenha.value = ''
    }

    async function carregarUsuarios() {
        const resposta = await window.api.usuario.listar()

        if (!resposta?.sucesso) {
            mostrarAvisoSemPermissao(resposta?.mensagem)
            configurarTelaSemPermissao()
        }

        const usuarios = resposta?.dados || []

        tbodyUsuarios.innerHTML = ''

        usuarios.forEach((usuario) => {
            const tr = document.createElement('tr')

            const tdlogin = document.createElement('td')
            tdlogin.textContent = usuario.login

            const tdTipo = document.createElement('td')
            tdTipo.textContent = Number(usuario.admin) === 1 ? 'Administrador' : 'Usuário'

            const tdStatus = document.createElement('td')
            tdStatus.textContent = 'Ativo'

            const tdAcoes = document.createElement('td')
            const divAcoes = document.createElement('div')
            divAcoes.className = 'tabela-usuarios-acoes'

            const btnAlterarSenha = document.createElement('button')
            btnAlterarSenha.type = 'button'
            btnAlterarSenha.className = 'btn-acao-usuario btn-alterar-senha'
            btnAlterarSenha.textContent = 'Alterar senha'
            btnAlterarSenha.dataset.id = usuario.id
            btnAlterarSenha.dataset.login = usuario.login
            btnAlterarSenha.dataset.acao = 'alterar-senha'

            const btnExcluir = document.createElement('button')
            btnExcluir.type = 'button'
            btnExcluir.className = 'btn-acao-usuario btn-excluir-usuario'
            btnExcluir.textContent = 'Excluir'
            btnExcluir.dataset.id = usuario.id
            btnExcluir.dataset.login = usuario.login
            btnExcluir.dataset.acao = 'excluir'

            const btnAlterarPermissao = document.createElement('button')
            btnAlterarPermissao.type = 'button'
            btnAlterarPermissao.className = 'btn-acao-usuario btn-alterar-permissao'
            btnAlterarPermissao.textContent = Number(usuario.admin) === 1 ? 'Tornar Usuário' : 'Tornar Admin'
            btnAlterarPermissao.dataset.id = usuario.id
            btnAlterarPermissao.dataset.login = usuario.login
            btnAlterarPermissao.dataset.admin = Number(usuario.admin)
            btnAlterarPermissao.dataset.acao = 'alterar-permissao'

            if (usuarioEhAdmin) {
                divAcoes.appendChild(btnAlterarSenha)
                divAcoes.appendChild(btnAlterarPermissao)
                divAcoes.appendChild(btnExcluir)
                tdAcoes.appendChild(divAcoes)
            }

            tr.appendChild(tdlogin)
            tr.appendChild(tdTipo)
            tr.appendChild(tdStatus)
            if (usuarioEhAdmin) {
                tr.appendChild(tdAcoes)
            }
            tbodyUsuarios.appendChild(tr)
        })
    }

    async function salvarNovoUsuario() {
        const login = inputNovologin.value.trim()
        const senha = inputNovoSenha.value.trim()
        const confirmarSenha = inputNovoConfirmarSenha.value.trim()

        if (!login || !senha || !confirmarSenha) {
            mostrarToast('Preencha todos os campos para criar o usuário', 'erro')
            return
        }
        if (senha !== confirmarSenha) {
            mostrarToast('As senhas não conferem', 'erro')
            return
        }

        const resposta = await window.api.usuario.criar({ login, senha })
        if (!resposta?.sucesso) {
            mostrarToast(resposta?.mensagem || 'Erro ao criar usuário', 'erro')
            return
        }

        mostrarToast('Usuário criado com sucesso')
        fecharModal(modalNovoUsuario)
        limparCamposNovoUsuario()
        await carregarUsuarios()
    }

    async function salvarAlteracaoSenha() {
        if (!usuarioSelecionado) return

        const senha = inputAlterarSenha.value.trim()
        const confirmarSenha = inputAlterarConfirmarSenha.value.trim()

        if (!senha || !confirmarSenha) {
            mostrarToast('Preencha os campos de senha', 'erro')
            return
        }
        if (senha !== confirmarSenha) {
            mostrarToast('As senhas não conferem', 'erro')
            return
        }

        if (!window.api.usuario.alterarSenha) {
            mostrarToast('Função de alterar senha indisponível', 'erro')
            return
        }

        const resposta = await window.api.usuario.alterarSenha({
            id: usuarioSelecionado.id,
            senha
        })

        if (!resposta?.sucesso) {
            mostrarToast(resposta?.mensagem || 'Erro ao alterar senha', 'erro')
            return
        }

        mostrarToast('Senha alterada com sucesso')
        fecharModal(modalAlterarSenha)
        limparCamposAlterarSenha()
        usuarioSelecionado = null
    }

    async function confirmarExclusaoUsuario() {
        if (!usuarioSelecionado) return

        const resposta = await window.api.usuario.desativar({ id: usuarioSelecionado.id })
        if (!resposta?.sucesso) {
            mostrarToast(resposta?.mensagem || 'Erro ao excluir usuário', 'erro')
            return
        }

        mostrarToast('Usuário excluído com sucesso')
        fecharModal(modalConfirmarExclusao)
        usuarioSelecionado = null
        await carregarUsuarios()
    }

    async function confirmarAlteracaoPermissao() {
        if (!usuarioSelecionado) return

        const resposta = await window.api.usuario.alterarPermissao({
            id: usuarioSelecionado.id,
            admin: usuarioSelecionado.novoAdmin
        })

        if (!resposta?.sucesso) {
            mostrarToast(resposta?.mensagem || 'Erro ao alterar permissão', 'erro')
            return
        }

        mostrarToast(resposta?.dados?.mensagem || 'Permissão alterada com sucesso')
        fecharModal(modalConfirmarPermissao)
        usuarioSelecionado = null
        await carregarUsuarios()
    }

    btnNovoUsuario.addEventListener('click', () => {
        if (!usuarioEhAdmin) return
        limparCamposNovoUsuario()
        abrirModal(modalNovoUsuario)
    })

    btnCancelarUsuario.addEventListener('click', () => fecharModal(modalNovoUsuario))
    btnSalvarUsuario.addEventListener('click', salvarNovoUsuario)

    btnCancelarSenha.addEventListener('click', () => {
        fecharModal(modalAlterarSenha)
        limparCamposAlterarSenha()
        usuarioSelecionado = null
    })
    btnSalvarSenha.addEventListener('click', salvarAlteracaoSenha)

    btnCancelarExclusao.addEventListener('click', () => {
        fecharModal(modalConfirmarExclusao)
        usuarioSelecionado = null
    })
    btnConfirmarExclusao.addEventListener('click', confirmarExclusaoUsuario)

    btnCancelarPermissao.addEventListener('click', () => {
        fecharModal(modalConfirmarPermissao)
        usuarioSelecionado = null
    })
    btnConfirmarPermissao.addEventListener('click', confirmarAlteracaoPermissao)

    tbodyUsuarios.addEventListener('click', async (event) => {
        if (!usuarioEhAdmin) return
        const botao = event.target.closest('button[data-acao]')
        if (!botao) return

        const id = Number(botao.dataset.id)
        const login = botao.dataset.login
        usuarioSelecionado = { id, login }

        if (botao.dataset.acao === 'alterar-senha') {
            textoUsuarioSelecionadoSenha.textContent = `Usuário: ${login}`
            limparCamposAlterarSenha()
            abrirModal(modalAlterarSenha)
            return
        }

        if (botao.dataset.acao === 'excluir') {
            textoConfirmacaoExclusao.textContent = `Deseja excluir o usuário "${login}"?`
            abrirModal(modalConfirmarExclusao)
            return
        }

        if (botao.dataset.acao === 'alterar-permissao') {
            const adminAtual = Number(botao.dataset.admin)
            const novoAdmin = adminAtual === 1 ? 0 : 1
            const tipoPermissao = novoAdmin === 1 ? 'administrador' : 'usuário'
            usuarioSelecionado = { id, login, novoAdmin }
            textoConfirmacaoPermissao.textContent = `Deseja alterar a permissão de "${login}" para ${tipoPermissao}?`
            abrirModal(modalConfirmarPermissao)
            return
        }
    })

    ;[modalNovoUsuario, modalAlterarSenha, modalConfirmarExclusao, modalConfirmarPermissao].forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                fecharModal(modal)
            }
        })
    })

    async function inicializarTelaUsuarios() {
        const sessao = await window.api.auth.buscarSessao()
        usuarioEhAdmin = !!sessao?.dados?.admin
        if (!usuarioEhAdmin) {
            mostrarAvisoSemPermissao('Apenas administradores podem gerenciar usuários.')
            configurarTelaSemPermissao()
            return
        }
        await carregarUsuarios()
    }

    inicializarTelaUsuarios()
})()