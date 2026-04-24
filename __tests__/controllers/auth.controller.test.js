jest.mock('../../services/AuthService', () => ({
  login: jest.fn()
}))

const AuthService = require('../../services/AuthService')
const session = require('../../session')
const AuthController = require('../../controllers/AuthController')

describe('AuthController', () => {
  afterEach(() => {
    session.setSessao(null)
    jest.clearAllMocks()
  })

  test('login deve salvar sessão e retornar sucesso', () => {
    const usuario = { id: 1, login: 'admin', admin: 1, ativo: 1 }
    AuthService.login.mockReturnValue(usuario)

    const resposta = AuthController.login({ login: 'admin', senha: '123456' })

    expect(resposta).toEqual({ sucesso: true, dados: usuario })
    expect(session.getSessao()).toEqual(usuario)
  })

  test('login deve retornar erro quando service lançar exceção', () => {
    AuthService.login.mockImplementation(() => {
      throw new Error('Falha no login')
    })

    const resposta = AuthController.login({ login: 'admin', senha: 'x' })
    expect(resposta).toEqual({ sucesso: false, mensagem: 'Falha no login' })
  })

  test('logout deve limpar sessão', () => {
    session.setSessao({ id: 9, login: 'teste' })
    const resposta = AuthController.logout()

    expect(resposta).toEqual({ sucesso: true })
    expect(session.getSessao()).toBeNull()
  })

  test('buscarSessao deve retornar sessão atual', () => {
    session.setSessao({ id: 2, login: 'maria' })
    const resposta = AuthController.buscarSessao()
    expect(resposta).toEqual({ sucesso: true, dados: { id: 2, login: 'maria' } })
  })
})

