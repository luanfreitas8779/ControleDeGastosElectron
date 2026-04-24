jest.mock('../../models/Log', () => ({
  buscarPorPeriodo: jest.fn()
}))

const Logs = require('../../models/Log')
const LogsService = require('../../services/LogsService')

describe('LogsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('buscarPorPeriodo deve usar a data atual de Rondonia no periodo padrao', () => {
    jest.setSystemTime(new Date('2026-04-16T02:30:00Z'))
    Logs.buscarPorPeriodo.mockReturnValue([])

    LogsService.buscarPorPeriodo()

    expect(Logs.buscarPorPeriodo).toHaveBeenCalledWith('2026-03-16', '2026-04-15')
  })

  test('buscarPorPeriodo deve respeitar datas informadas manualmente', () => {
    Logs.buscarPorPeriodo.mockReturnValue([])

    LogsService.buscarPorPeriodo('2026-04-01', '2026-04-10')

    expect(Logs.buscarPorPeriodo).toHaveBeenCalledWith('2026-04-01', '2026-04-10')
  })
})
