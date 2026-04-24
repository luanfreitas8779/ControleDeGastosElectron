jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}))

jest.mock('../../models/Usuario', () => ({
  buscarPorLogin: jest.fn(),
  buscarPorId: jest.fn(),
  criar: jest.fn(),
  listar: jest.fn(),
  contarUsuariosAtivos: jest.fn(),
  contarAdminsAtivos: jest.fn(),
  desativar: jest.fn(),
  alterarSenha: jest.fn(),
  alterarPermissao: jest.fn()
}))

const bcrypt = require('bcryptjs')
const Usuario = require('../../models/Usuario')
const UsuarioService = require('../../services/UsuarioService')

describe('UsuarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('criar deve falhar com login já existente', async () => {
    Usuario.buscarPorLogin.mockReturnValue({ id: 1, login: 'existente' })

    await expect(
      UsuarioService.criar({ login: 'existente', senha: '123456' })
    ).rejects.toThrow('Já existe um usuário com esse login')
  })

  test('criar deve criar usuário quando dados são válidos', async () => {
    Usuario.buscarPorLogin.mockReturnValue(null)
    bcrypt.hash.mockResolvedValue('hash-123')
    Usuario.criar.mockReturnValue(5)

    const resultado = await UsuarioService.criar({ login: 'novo', senha: '123456' })

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
    expect(Usuario.criar).toHaveBeenCalledWith({ login: 'novo', senha_hash: 'hash-123' })
    expect(resultado).toEqual({ mensagem: 'Usuário criado com sucesso', id: 5, login: 'novo' })
  })

  test('alterarPermissao deve validar valor inválido', () => {
    expect(() => UsuarioService.alterarPermissao({ id: 1, admin: 2 })).toThrow('Valor de permissão inválido')
  })

  test('alterarPermissao deve impedir remoção do último administrador ativo', () => {
    Usuario.buscarPorId.mockReturnValue({ id: 1, ativo: 1, admin: 1 })
    Usuario.contarAdminsAtivos.mockReturnValue(1)

    expect(() => UsuarioService.alterarPermissao({ id: 1, admin: 0 })).toThrow(
      'O sistema deve ter no mínimo 1 administrador ativo'
    )
  })

  test('desativar deve retornar sucesso quando model altera usuário', () => {
    Usuario.buscarPorId.mockReturnValue({ id: 7, ativo: 1, admin: 0 })
    Usuario.contarUsuariosAtivos.mockReturnValue(2)
    Usuario.desativar.mockReturnValue(1)

    const resultado = UsuarioService.desativar({ id: 7 })
    expect(resultado).toEqual({ mensagem: 'Usuário desativado com sucesso', id: 7 })
  })

  test('desativar deve impedir exclusão do único usuário ativo do sistema', () => {
    Usuario.buscarPorId.mockReturnValue({ id: 7, ativo: 1, admin: 1 })
    Usuario.contarUsuariosAtivos.mockReturnValue(1)

    expect(() => UsuarioService.desativar({ id: 7 })).toThrow(
      'Não é permitido desativar o único usuário ativo do sistema'
    )
  })
})

