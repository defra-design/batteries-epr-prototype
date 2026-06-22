import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

const validPayload = {
  firstName: 'Aoife',
  lastName: 'Murphy',
  position: 'Director',
  email: 'aoife@ni.example',
  phone: '02890000000'
}

describe('#niOnboardingContactDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the contact details form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingContactDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('id="firstName"'))
  })

  test('POST with missing fields redirects back and flashes errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingContactDetails,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingContactDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST with valid data saves and continues, hydrating on return', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingContactDetails,
      payload: validPayload
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingBatteryCategories)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingContactDetails,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Aoife'))
  })
})
