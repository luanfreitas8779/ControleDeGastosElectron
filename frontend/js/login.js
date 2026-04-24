(function () {
    //Função do Toast
    
    function showToast(mensagem, tipo = 'sucesso') {
        const toast = document.createElement('div')
        toast.className = `toast toast-${tipo}`
        toast.textContent = mensagem
        document.body.appendChild(toast)

        setTimeout(() => toast.remove(), 3000)
    }
    
    document.getElementById('btn-entrar').addEventListener('click', async () => {
    const login = document.getElementById('input-login').value
    const senha = document.getElementById('input-senha').value

    const resultado = await window.api.auth.login({login, senha})
    console.log(resultado)
    if (resultado.sucesso) {
        // Login bem sucedido — abre a tela principal completa
        // (app.html já contém o elemento #conteudo)
        window.location.href = 'app.html'
    } else {
        // Mostra o erro retornado pelo service
        showToast(resultado.mensagem, 'erro')
    }
})

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault()
})

})()