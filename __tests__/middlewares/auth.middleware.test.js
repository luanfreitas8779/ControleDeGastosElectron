const authMiddleware = require('../../middlewares/auth.middleware')
const sessao = require('../../session')

describe('authMiddleware', () => {
  afterEach(() => {
    sessao.setSessao(null)
  })

  test('deve lançar erro quando não existir sessão', () => {
    expect(() => authMiddleware({})).toThrow('Não autorizado, faça login novamente!')
  })

  test('deve injetar usuario_id e usuario_logado quando sessão existir', () => {
    const usuario = { id: 7, login: 'joao', admin: 0 }
    sessao.setSessao(usuario)

    const resultado = authMiddleware({ campo: 'valor' })

    expect(resultado).toEqual({
      campo: 'valor',
      usuario_id: 7,
      usuario_logado: usuario
    })
  })
})

