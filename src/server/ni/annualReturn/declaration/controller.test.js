import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niAnnualReturnDeclaration', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the declaration form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnDeclaration
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-ar-declaration-confirm"')
    )
  })

  test('POST without confirming redirects back and flashes errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnDeclaration,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnDeclaration,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-annual-return-error-summary')
    )
  })

  test('POST with a confirmed declaration saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niAnnualReturnDeclaration,
      payload: {
        firstName: 'Aoife',
        lastName: 'Murphy',
        position: 'Director',
        confirm: 'on'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niAnnualReturnConfirmation)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niAnnualReturnDeclaration,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Aoife'))
  })
})
