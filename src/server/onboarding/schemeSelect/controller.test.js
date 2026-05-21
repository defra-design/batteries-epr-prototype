import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#schemeSelect', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders a radio item for each seeded approved scheme', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.onboardingSchemeSelect
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="scheme-select-radio-22222222-0001-4000-a000-000000000001"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="scheme-select-radio-22222222-0001-4000-a000-000000000002"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="scheme-select-radio-22222222-0001-4000-a000-000000000004"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-select-cannot-find"')
    )
  })

  test('POST with a valid schemeId renders savedFields and onward target', async () => {
    const schemeId = '22222222-0001-4000-a000-000000000001'
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingSchemeSelect,
      payload: { schemeId }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(`"schemeId":"${schemeId}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.onboardingSchemeConfirm}"`)
    )
  })

  test('POST with a missing schemeId redirects with flash error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingSchemeSelect,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST with a non-uuid schemeId redirects with flash error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.onboardingSchemeSelect,
      payload: { schemeId: 'not-a-uuid' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET after failed POST renders the error summary', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.onboardingSchemeSelect,
      payload: {}
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingSchemeSelect,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="onboarding-error-summary"')
    )
  })

  test('GET honours ?return and emits it in the form action', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingSchemeSelect}?return=${encodeURIComponent('/account')}`
    })
    expect(result).toEqual(expect.stringContaining('return=%2Faccount'))
  })

  test('POST honours ?return and routes nextStep back there', async () => {
    const schemeId = '22222222-0001-4000-a000-000000000001'
    const { result } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingSchemeSelect}?return=${encodeURIComponent('/account')}`,
      payload: { schemeId }
    })
    expect(result).toEqual(expect.stringContaining('"nextStep":"/account"'))
  })

  test('POST failure honours ?return on the redirect target', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: `${paths.onboardingSchemeSelect}?return=${encodeURIComponent('/account')}`,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toEqual(
      expect.stringContaining('return=%2Faccount')
    )
  })

  test('GET ignores an unsafe ?return value', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.onboardingSchemeSelect}?return=https://evil.example/`
    })
    expect(result).not.toEqual(expect.stringContaining('evil.example'))
  })
})
