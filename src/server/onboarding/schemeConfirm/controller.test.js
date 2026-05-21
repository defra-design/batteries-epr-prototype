import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#schemeConfirm', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the placeholder summary list and a continue button', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingSchemeConfirm
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-confirm-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-confirm-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-continue"')
    )
  })

  test('POST renders savedFields and routes nextStep to the scheme declaration variant', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingSchemeConfirm,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"schemeConfirmed":true'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.onboardingDeclaration}?route=complianceScheme"`
      )
    )
  })

  test('GET honours ?return and emits it in the form action', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingSchemeConfirm}?return=${encodeURIComponent('/account')}`
    })
    expect(result).toEqual(expect.stringContaining('return=%2Faccount'))
  })

  test('POST honours ?return and routes nextStep back there', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingSchemeConfirm}?return=${encodeURIComponent('/account')}`,
      payload: {}
    })
    expect(result).toEqual(expect.stringContaining('"nextStep":"/account"'))
  })

  test('GET ignores an unsafe ?return value', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingSchemeConfirm}?return=https://evil.example/`
    })
    expect(result).not.toEqual(expect.stringContaining('evil.example'))
  })
})
