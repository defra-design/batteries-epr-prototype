import { noIndexHeaders } from './no-index-headers.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'

describe('noIndexHeaders unit', () => {
  const h = { continue: Symbol('continue') }

  test('sets the X-Robots-Tag header on a normal response', () => {
    const header = vi.fn()
    const result = noIndexHeaders({ response: { header } }, h)

    expect(header).toHaveBeenCalledWith('X-Robots-Tag', 'noindex, nofollow')
    expect(result).toBe(h.continue)
  })

  test('sets the X-Robots-Tag header on a boom response', () => {
    const response = { isBoom: true, output: { headers: {} } }
    const result = noIndexHeaders({ response }, h)

    expect(response.output.headers['X-Robots-Tag']).toBe('noindex, nofollow')
    expect(result).toBe(h.continue)
  })
})

describe('noIndexHeaders integration', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test.each(['/password', '/health', '/does-not-exist'])(
    'every response from %s tells crawlers not to index',
    async (url) => {
      const { headers } = await server.inject({ method: 'GET', url })

      expect(headers['x-robots-tag']).toBe('noindex, nofollow')
    }
  )
})
