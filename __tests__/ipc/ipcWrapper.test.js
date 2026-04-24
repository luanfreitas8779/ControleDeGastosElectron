const handlers = {}

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn((canal, fn) => {
      handlers[canal] = fn
    })
  }
}))

const ipcWrapper = require('../../ipc/ipcWrapper')

describe('ipcWrapper', () => {
  beforeEach(() => {
    Object.keys(handlers).forEach((k) => delete handlers[k])
  })

  test('deve executar middlewares em sequência e chamar handler', async () => {
    const middleware1 = jest.fn((dados) => ({ ...dados, a: 1 }))
    const middleware2 = jest.fn((dados) => ({ ...dados, b: 2 }))
    const handler = jest.fn((dados) => ({ sucesso: true, dados }))

    ipcWrapper('canal:teste', [middleware1, middleware2], handler)
    const resposta = await handlers['canal:teste']({}, { origem: true })

    expect(middleware1).toHaveBeenCalledWith({ origem: true })
    expect(middleware2).toHaveBeenCalledWith({ origem: true, a: 1 })
    expect(handler).toHaveBeenCalledWith({ origem: true, a: 1, b: 2 })
    expect(resposta).toEqual({ sucesso: true, dados: { origem: true, a: 1, b: 2 } })
  })

  test('deve capturar erro de middleware e retornar falha padronizada', async () => {
    const middleware = () => {
      throw new Error('Sem permissão')
    }
    ipcWrapper('canal:erro', [middleware], () => ({ sucesso: true }))

    const resposta = await handlers['canal:erro']({}, {})
    expect(resposta).toEqual({ sucesso: false, mensagem: 'Sem permissão' })
  })
})

