import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#brandNames', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders textarea', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingBrandNames
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('name="brandNamesText"'))
  })

  test('POST splits and dedupes brand names', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingBrandNames,
      payload: { brandNamesText: 'Acme\n\nAcme\nAcme Pro\n  ' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"brandNames":["Acme","Acme Pro"]')
    )
  })

  test('POST with all-blank text redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingBrandNames,
      payload: { brandNamesText: '   \n  \n' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET with ?return=/account preserves the return on the form action', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingBrandNames}?return=%2Faccount`
    })
    expect(result).toEqual(
      expect.stringContaining(`${paths.onboardingBrandNames}?return=%2Faccount`)
    )
  })

  test('POST with ?return=/account uses /account as nextStep', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingBrandNames}?return=%2Faccount`,
      payload: { brandNamesText: 'Acme\nAcme Pro' }
    })
    expect(result).toEqual(expect.stringContaining('"nextStep":"/account"'))
  })

  test('POST validation failure with ?return preserves the redirect target', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingBrandNames}?return=%2Faccount`,
      payload: { brandNamesText: '   ' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.onboardingBrandNames}?return=%2Faccount`
    )
  })

  test('GET after failed POST renders flash error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingBrandNames,
      payload: { brandNamesText: '' }
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingBrandNames,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
  })
})
