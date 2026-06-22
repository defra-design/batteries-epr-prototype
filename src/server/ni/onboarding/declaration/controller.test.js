import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#niOnboardingDeclaration', () => {
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
      url: paths.niOnboardingDeclaration
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-declaration-confirm"')
    )
  })

  test('POST without confirming redirects back and flashes errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingDeclaration,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingDeclaration,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST with a confirmed declaration saves and continues', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingDeclaration,
      payload: {
        firstName: 'Aoife',
        lastName: 'Murphy',
        position: 'Director',
        confirm: 'on'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingConfirmation)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingDeclaration,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Aoife'))
  })
})
