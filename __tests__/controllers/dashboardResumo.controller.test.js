jest.mock('../../services/DashboardResumoService', () => ({
  resumo: jest.fn(),
  lancamentosDoDiaUsuario: jest.fn()
}))

const DashboardResumoService = require('../../services/DashboardResumoService')
const DashboardResumoController = require('../../controllers/DashboardReusmoController')

describe('DashboardResumoController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('resumo deve retornar sucesso quando service não falhar', () => {
    const fakeResumo = { saldo: 100 }
    DashboardResumoService.resumo.mockReturnValue(fakeResumo)

    const resposta = DashboardResumoController.resumo({
      dataInicio: '2026-03-01',
      dataFim: '2026-03-31'
    })

    expect(resposta).toEqual({ sucesso: true, dados: fakeResumo })
  })

  test('resumo deve retornar erro quando service lançar exceção', () => {
    DashboardResumoService.resumo.mockImplementation(() => {
      throw new Error('erro de teste')
    })

    const resposta = DashboardResumoController.resumo({})
    expect(resposta).toEqual({ sucesso: false, mensagem: 'erro de teste' })
  })

  test('lancamentosDoDiaUsuario deve usar login da sessão e retornar sucesso', () => {
    const fakeLancamentos = { listaVendas: [], listaGastos: [] }
    DashboardResumoService.lancamentosDoDiaUsuario.mockReturnValue(fakeLancamentos)

    const resposta = DashboardResumoController.lancamentosDoDiaUsuario({
      usuario_logado: { login: 'ana' }
    })

    expect(DashboardResumoService.lancamentosDoDiaUsuario).toHaveBeenCalledWith('ana')
    expect(resposta).toEqual({ sucesso: true, dados: fakeLancamentos })
  })
})

