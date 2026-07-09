import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

const validPayload = {
  companyName: 'NI Batteries Ltd',
  companyRegistrationNo: 'NI123456',
  line1: '1 Belfast Road',
  town: 'Belfast',
  postcode: 'BT1 1AA'
}

describe('#niOnboardingCompanyDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the company details form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingCompanyDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-company-name"')
    )
  })

  test('POST with missing fields redirects back and flashes errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingCompanyDetails,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingCompanyDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('ni-onboarding-error-summary')
    )
  })

  test('POST with valid data saves and continues, hydrating on return', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.niOnboardingCompanyDetails,
      payload: validPayload
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.niOnboardingContactDetails)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niOnboardingCompanyDetails,
      headers: { cookie }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('NI Batteries Ltd'))
  })
})
