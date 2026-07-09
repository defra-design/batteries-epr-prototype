import { initialiseServer } from '../test-utils/initialise-server.js'
import { statusCodes } from './common/constants/status-codes.js'
import { config } from '../config/config.js'

describe('createServer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('registers extra plugins passed via mockedPlugins', async () => {
    const fakePlugin = {
      plugin: {
        name: 'fakePlugin',
        register(server) {
          server.route({
            method: 'GET',
            path: '/test/fake-plugin',
            handler: () => ({ ok: true })
          })
        }
      }
    }

    const server = await initialiseServer({
      mockedPlugins: { fakePlugin }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/test/fake-plugin'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({ ok: true })

    await server.stop({ timeout: 0 })
  })

  test('sets server uri to appBaseUrl in development', async () => {
    const actualGet = config.get.bind(config)
    const expectedUri = actualGet('appBaseUrl')
    vi.spyOn(config, 'get').mockImplementation((key) =>
      key === 'isDevelopment' ? true : actualGet(key)
    )

    const server = await initialiseServer()

    expect(server.info.uri).toBe(expectedUri)

    await server.stop({ timeout: 0 })
  })
})
