jest.mock('../../models/Usuario', () => ({
  buscarPorLogin: jest.fn()
}))

jest.mock('bcryptjs', () => ({
  compareSync: jest.fn()
}))

const Usuario = require('../../models/Usuario')
const bcrypt = require('bcryptjs')
const AuthService = require('../../services/AuthService')

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('deve falhar quando login ou senha não forem enviados', () => {
    expect(() => AuthService.login({ login: '', senha: '' })).toThrow('Login e senha são obrigatórios')
  })

  test('deve falhar quando usuário não existir', () => {
    Usuario.buscarPorLogin.mockReturnValue(undefined)
    expect(() => AuthService.login({ login: 'joao', senha: '123456' })).toThrow('Login ou senha inválidos')
  })

  test('deve falhar quando usuário estiver inativo', () => {
    Usuario.buscarPorLogin.mockReturnValue({ ativo: 0 })
    expect(() => AuthService.login({ login: 'joao', senha: '123456' })).toThrow('Usuário inativo. Contate o administrador.')
  })

  test('deve falhar quando senha for inválida', () => {
    Usuario.buscarPorLogin.mockReturnValue({
      id: 1,
      login: 'joao',
      ativo: 1,
      admin: 0,
      senha_hash: 'hash'
    })
    bcrypt.compareSync.mockReturnValue(false)

    expect(() => AuthService.login({ login: 'joao', senha: '123456' })).toThrow('Login ou senha inválidos')
  })

  test('deve retornar dados do usuário quando login for válido', () => {
    Usuario.buscarPorLogin.mockReturnValue({
      id: 1,
      login: 'admin',
      ativo: 1,
      admin: 1,
      senha_hash: 'hash'
    })
    bcrypt.compareSync.mockReturnValue(true)

    const resultado = AuthService.login({ login: 'admin', senha: '123456' })
    expect(resultado).toEqual({
      id: 1,
      login: 'admin',
      ativo: 1,
      admin: 1
    })
  })
})

