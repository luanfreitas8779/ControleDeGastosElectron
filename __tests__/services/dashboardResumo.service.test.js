jest.mock('../../models/Gasto', () => ({
  buscarPorPeriodo: jest.fn(),
  somarGastosPorPeriodo: jest.fn(),
  somarGastosFixosVariaveisPorPeriodo: jest.fn(),
  buscarPorPeriodoEUsuario: jest.fn()
}))

jest.mock('../../models/Venda', () => ({
  buscarPorPeriodo: jest.fn(),
  somarVendasPorPeriodo: jest.fn(),
  buscaVendaUltimoAno: jest.fn(),
  buscarPorPeriodoEUsuario: jest.fn()
}))

const Gasto = require('../../models/Gasto')
const Venda = require('../../models/Venda')
const DashboardResumoService = require('../../services/DashboardResumoService')

describe('DashboardResumoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('resumo deve agregar dados e calcular saldo', () => {
    Venda.buscarPorPeriodo.mockReturnValue([{ id: 1 }])
    Venda.somarVendasPorPeriodo.mockReturnValue({ total: 200 })
    Venda.buscaVendaUltimoAno.mockReturnValue([{ mes_ano: '2026-03', total: 200 }])
    Gasto.buscarPorPeriodo.mockReturnValue([{ id: 2 }])
    Gasto.somarGastosPorPeriodo.mockReturnValue({ total: 50 })
    Gasto.somarGastosFixosVariaveisPorPeriodo.mockReturnValue([{ fixo_variavel: 'Fixo', total: 50 }])

    const resultado = DashboardResumoService.resumo('2026-03-01', '2026-03-31')

    expect(Venda.buscarPorPeriodo).toHaveBeenCalledWith('2026-03-01', '2026-03-31')
    expect(Gasto.buscarPorPeriodo).toHaveBeenCalledWith('2026-03-01', '2026-03-31')
    expect(resultado.saldo).toBe(150)
    expect(resultado.listaVendas).toEqual([{ id: 1 }])
    expect(resultado.listaGastos).toEqual([{ id: 2 }])
    expect(resultado.vendaUltimoAno).toEqual([{ mes_ano: '2026-03', total: 200 }])
  })

  test('lancamentosDoDiaUsuario deve consultar gastos e vendas do usuário no dia', () => {
    Venda.buscarPorPeriodoEUsuario.mockReturnValue([{ id: 10, tipo: 'venda' }])
    Gasto.buscarPorPeriodoEUsuario.mockReturnValue([{ id: 11, tipo: 'gasto' }])

    const resultado = DashboardResumoService.lancamentosDoDiaUsuario('maria')

    expect(Venda.buscarPorPeriodoEUsuario).toHaveBeenCalledTimes(1)
    expect(Gasto.buscarPorPeriodoEUsuario).toHaveBeenCalledTimes(1)
    expect(Venda.buscarPorPeriodoEUsuario.mock.calls[0][2]).toBe('maria')
    expect(Gasto.buscarPorPeriodoEUsuario.mock.calls[0][2]).toBe('maria')
    expect(resultado).toEqual({
      listaVendas: [{ id: 10, tipo: 'venda' }],
      listaGastos: [{ id: 11, tipo: 'gasto' }]
    })
  })
})

