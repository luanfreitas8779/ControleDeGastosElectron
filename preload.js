const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    gasto: {
        criar: (dataGasto, valorGasto, descricaoGasto, fixoVariavel,categoria, nome_user) => ipcRenderer.invoke('gasto:criar', dataGasto, valorGasto, descricaoGasto, fixoVariavel, categoria, nome_user),
        editar: (dados) => ipcRenderer.invoke('gasto:editar', dados),
        deletar: (dados) => ipcRenderer.invoke('gasto:deletar', dados),
        buscarPorPeriodo: (dados) => ipcRenderer.invoke('gasto:buscarPorPeriodo', dados),
    },
    categoria: {
        criar: (dados) => ipcRenderer.invoke('categoria:criar', dados),
        deletar: (dados) => ipcRenderer.invoke('categoria:deletar', dados),
        listar: (dados) => ipcRenderer.invoke('categoria:listar', dados)
    },
    recorrente: {
        criar: (dados) => ipcRenderer.invoke('recorrente:criar', dados),
        deletar: (dados) => ipcRenderer.invoke('recorrente:deletar', dados),
        listar: (dados) => ipcRenderer.invoke('recorrente:listar', dados)
    },
    venda: {
        criar: (dataVenda, valorVenda, nome_user) => ipcRenderer.invoke('venda:criar', dataVenda, valorVenda, nome_user),
        editar: (dados) => ipcRenderer.invoke('venda:editar', dados),
        deletar: (dados) => ipcRenderer.invoke('venda:deletar', dados),
        buscarPorPeriodo: (dados) => ipcRenderer.invoke('venda:buscarPorPeriodo', dados),
        somarVendasPorPeriodo: (dados) => ipcRenderer.invoke('venda:somarVendasPorPeriodo', dados)
    },
    usuario: {
        criar: (dados) => ipcRenderer.invoke('usuario:criar', dados),
        desativar: (dados) => ipcRenderer.invoke('usuario:desativar', dados),
        listar: (dados) => ipcRenderer.invoke('usuario:listar', dados),
        alterarSenha: (dados) => ipcRenderer.invoke('usuario:alterarSenha', dados),
        alterarPermissao: (dados) => ipcRenderer.invoke('usuario:alterarPermissao', dados)
    },
    dashboardResumo: {
        resumo: (dataInicio, dataFim) =>  ipcRenderer.invoke('dashboardResumo:resumo', dataInicio, dataFim),
        lancamentosDoDiaUsuario: () => ipcRenderer.invoke('dashboardResumo:lancamentosDoDiaUsuario')
    },
    auth: {
        login: (login, senha) => ipcRenderer.invoke('auth:login', login, senha ),
        logout: () => ipcRenderer.invoke('auth:logout'),
        buscarSessao: () => ipcRenderer.invoke('auth:sessao')
    },
    logs: {
        buscarPorPeriodo: (dados) => ipcRenderer.invoke('logs:buscarPorPeriodo', dados)
    }
})