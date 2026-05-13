import { initialiseServer } from '../test-utils/initialise-server.js'
import { statusCodes } from './common/constants/status-codes.js'

describe('createServer', () => {
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
})
