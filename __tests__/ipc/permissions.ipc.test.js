const mockIpcWrapper = jest.fn()

jest.mock('../../ipc/ipcWrapper', () => mockIpcWrapper)
jest.mock('../../controllers/DashboardReusmoController', () => ({
  resumo: jest.fn(),
  lancamentosDoDiaUsuario: jest.fn()
}))
jest.mock('../../controllers/UsuarioController', () => ({
  criar: jest.fn(),
  listar: jest.fn(),
  desativar: jest.fn(),
  alterarSenha: jest.fn(),
  alterarPermissao: jest.fn()
}))
jest.mock('../../controllers/GastoController', () => ({
  criar: jest.fn(),
  editar: jest.fn(),
  deletar: jest.fn(),
  buscarPorPeriodo: jest.fn(),
  somarGastosPorPeriodo: jest.fn()
}))
jest.mock('../../controllers/VendaController', () => ({
  criar: jest.fn(),
  editar: jest.fn(),
  deletar: jest.fn(),
  buscarPorPeriodo: jest.fn(),
  somarVendasPorPeriodo: jest.fn()
}))
jest.mock('../../models/Gasto', () => ({}))
jest.mock('../../models/Venda', () => ({}))
jest.mock('../../middlewares/log.middleware', () => jest.fn())

const sessao = require('../../session')
require('../../ipc/dashboardResumo.ipc')
require('../../ipc/usuario.ipc')
require('../../ipc/gasto.ipc')
require('../../ipc/venda.ipc')

function getRegistration(canal) {
  return mockIpcWrapper.mock.calls.find((call) => call[0] === canal)
}

describe('IPC permissions matrix', () => {
  beforeEach(() => {
    sessao.setSessao(null)
  })

  test('dashboardResumo:resumo deve bloquear não-admin', () => {
    const registration = getRegistration('dashboardResumo:resumo')
    const middlewares = registration[1]
    const isAdmin = middlewares[0]

    sessao.setSessao({ id: 2, login: 'user', admin: 0 })
    expect(() => isAdmin({})).toThrow('Você não tem permissão para visualizar esta tela!')
  })

  test('dashboardResumo:lancamentosDoDiaUsuario deve permitir usuário logado', () => {
    const registration = getRegistration('dashboardResumo:lancamentosDoDiaUsuario')
    const middlewares = registration[1]
    const authMiddleware = middlewares[0]

    sessao.setSessao({ id: 3, login: 'colaborador', admin: 0 })
    const dados = authMiddleware({ teste: true })

    expect(dados.usuario_id).toBe(3)
    expect(dados.usuario_logado.login).toBe('colaborador')
  })

  test('usuario:listar deve bloquear não-admin', () => {
    const registration = getRegistration('usuario:listar')
    const middlewares = registration[1]
    const isAdmin = middlewares[1]

    sessao.setSessao({ id: 1, login: 'user', admin: 0 })
    expect(() => isAdmin({})).toThrow('Você não tem permissão para isso')
  })

  test('gasto:criar deve exigir autenticação e permitir não-admin autenticado', () => {
    const registration = getRegistration('gasto:criar')
    const middlewares = registration[1]
    const authMiddleware = middlewares[0]

    sessao.setSessao({ id: 8, login: 'funcionario', admin: 0 })
    const dados = authMiddleware({ valorGasto: 10 })
    expect(dados.usuario_id).toBe(8)
  })

  test('gasto:editar deve bloquear não-admin', () => {
    const registration = getRegistration('gasto:editar')
    const middlewares = registration[1]
    const isAdmin = middlewares[1]

    sessao.setSessao({ id: 8, login: 'funcionario', admin: 0 })
    expect(() => isAdmin({ id: 100 })).toThrow('Você não tem permissão para visualizar esta tela!')
  })

  test('venda:editar deve bloquear não-admin', () => {
    const registration = getRegistration('venda:editar')
    const middlewares = registration[1]
    const isAdmin = middlewares[1]

    sessao.setSessao({ id: 8, login: 'funcionario', admin: 0 })
    expect(() => isAdmin({ id: 100 })).toThrow('Você não tem permissão para isso')
  })
})

