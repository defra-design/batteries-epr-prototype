import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

const validPayload = {
  declarationFirstName: 'Sam',
  declarationLastName: 'Smith',
  declarationPosition: 'Director',
  declarationConfirm: 'yes'
}

describe('#declaration', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the chrome', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingDeclaration
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('name="declarationConfirm"'))
  })

  test('POST valid renders payload with target registration-and-submit', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingDeclaration,
      payload: validPayload
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"target":"registration-and-submit"')
    )
    expect(result).toEqual(expect.stringContaining('"declaration":'))
    expect(result).toEqual(expect.stringContaining('"firstName":"Sam"'))
    expect(result).toEqual(
      expect.stringContaining('"nextStep":"/onboarding/confirmation"')
    )
  })

  test('POST without confirmation checkbox redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingDeclaration,
      payload: { ...validPayload, declarationConfirm: '' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST missing names redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingDeclaration,
      payload: {
        ...validPayload,
        declarationFirstName: '',
        declarationLastName: '',
        declarationPosition: ''
      }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET after failed POST renders flash errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingDeclaration,
      payload: {}
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingDeclaration,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
  })

  test('GET with ?route=complianceScheme renders the scheme-route copy', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingDeclaration}?route=complianceScheme`
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('joint and several liability')
    )
    expect(result).toEqual(
      expect.stringContaining('action="/onboarding/declaration?route=complianceScheme"')
    )
  })

  test('POST with ?route=complianceScheme preserves the route and onward target', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingDeclaration}?route=complianceScheme`,
      payload: validPayload
    })
    expect(result).toEqual(
      expect.stringContaining('action="/onboarding/declaration?route=complianceScheme"')
    )
    expect(result).toEqual(
      expect.stringContaining('"target":"registration-and-submit"')
    )
  })

  test('POST with ?route=complianceScheme failure redirects back to the scheme variant', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingDeclaration}?route=complianceScheme`,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe('/onboarding/declaration?route=complianceScheme')
  })
})
