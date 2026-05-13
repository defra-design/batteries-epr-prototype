import { vi } from 'vitest'

describe('loggerOptions', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('@defra/hapi-tracing')
  })

  test('mixin returns empty object when no trace id present', async () => {
    vi.doMock('@defra/hapi-tracing', () => ({
      getTraceId: () => null
    }))

    const { loggerOptions } = await import('./logger-options.js')
    expect(loggerOptions.mixin()).toEqual({})
  })

  test('mixin returns trace id when present', async () => {
    vi.doMock('@defra/hapi-tracing', () => ({
      getTraceId: () => 'trace-123'
    }))

    const { loggerOptions } = await import('./logger-options.js')
    expect(loggerOptions.mixin()).toEqual({ trace: { id: 'trace-123' } })
  })

  test('uses pino-pretty transport when configured', async () => {
    vi.doMock('../../../../config/config.js', async () => {
      const actual = await vi.importActual('../../../../config/config.js')
      return {
        ...actual,
        config: {
          ...actual.config,
          get(key) {
            if (key === 'log') {
              return {
                enabled: true,
                level: 'info',
                format: 'pino-pretty',
                redact: []
              }
            }
            if (key === 'isDevelopment') return true
            return actual.config.get(key)
          }
        }
      }
    })

    const { loggerOptions } = await import('./logger-options.js')
    expect(loggerOptions.transport).toEqual({
      target: 'pino-pretty',
      options: expect.objectContaining({ ignore: 'pid,res,req' })
    })

    vi.doUnmock('../../../../config/config.js')
  })
})
