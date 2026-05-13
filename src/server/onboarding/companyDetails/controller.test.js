import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { content } from '../../../config/content.js'

describe('#companyDetails GET', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the form chrome', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingCompanyDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.onboardingCompanyDetails({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-form"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="company-registration-no"')
    )
    expect(result).toEqual(expect.stringContaining('"step":"companyDetails"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })
})

describe('#companyDetails POST', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const validPayload = {
    companyRegistrationNo: '12345678',
    companyName: 'Acme Power Ltd',
    tradingName: '',
    webAddress: 'https://acme.example.com',
    sicCode: '27200',
    line1: '1 Test Way',
    line2: '',
    town: 'Manchester',
    postcode: 'M1 4AA'
  }

  test('on valid payload renders success interstitial with savedFields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingCompanyDetails,
      payload: validPayload
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"producer"'))
    expect(result).toEqual(
      expect.stringContaining('"companyName":"Acme Power Ltd"')
    )
    expect(result).toEqual(
      expect.stringContaining('"nextStep":"/onboarding/contact-details"')
    )
  })

  test('on invalid registration number redirects with flash error', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.onboardingCompanyDetails,
      payload: { ...validPayload, companyRegistrationNo: '123' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.onboardingCompanyDetails)
  })

  test('on missing required address fields redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingCompanyDetails,
      payload: { ...validPayload, line1: '', town: '', postcode: '' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET with ?return=/account preserves the return on the form action', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingCompanyDetails}?return=%2Faccount`
    })
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.onboardingCompanyDetails}?return=%2Faccount`
      )
    )
  })

  test('POST with ?return=/account uses /account as nextStep', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingCompanyDetails}?return=%2Faccount`,
      payload: validPayload
    })
    expect(result).toEqual(expect.stringContaining('"nextStep":"/account"'))
  })

  test('POST validation failure with ?return preserves the redirect target', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingCompanyDetails}?return=%2Faccount`,
      payload: { ...validPayload, postcode: 'nope' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.onboardingCompanyDetails}?return=%2Faccount`
    )
  })

  test('subsequent GET shows the flashed error summary and prefills', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingCompanyDetails,
      payload: { ...validPayload, postcode: 'not a postcode' }
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    expect(cookie).toBeDefined()

    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingCompanyDetails,
      headers: { cookie }
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('value="not a postcode"'))
  })
})
