import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niAnnualReturnConfirmation', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET allocates a reference and reuses it on refresh', async () => {
    const first = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnConfirmation
    })
    expect(first.statusCode).toBe(statusCodes.ok)
    expect(first.result).toEqual(
      expect.stringContaining('data-testid="ni-ar-reference"')
    )
    expect(first.result).toEqual(expect.stringContaining('NI-AR-'))

    const cookie = first.headers['set-cookie']?.[0]?.split(';')[0]
    const reference = first.result.match(
      /data-testid="ni-ar-reference">([^<]*)/
    )[1]

    const second = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnConfirmation,
      headers: { cookie }
    })
    expect(second.statusCode).toBe(statusCodes.ok)
    expect(second.result).toEqual(expect.stringContaining(reference))
  })
})
