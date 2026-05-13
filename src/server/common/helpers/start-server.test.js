import { vi } from 'vitest'

describe('startServer', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('../../server.js')
  })

  test('creates the server, starts it, and logs the listening URL', async () => {
    const startMock = vi.fn().mockResolvedValue(undefined)
    const infoMock = vi.fn()
    const createServerMock = vi.fn().mockResolvedValue({
      start: startMock,
      logger: { info: infoMock }
    })

    vi.doMock('../../server.js', () => ({
      createServer: createServerMock
    }))

    const { startServer } = await import('./start-server.js')
    const server = await startServer()

    expect(createServerMock).toHaveBeenCalled()
    expect(startMock).toHaveBeenCalled()
    expect(infoMock).toHaveBeenCalledWith('Server started successfully')
    expect(infoMock).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:')
    )
    expect(server.logger.info).toBe(infoMock)
  })
})
