import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import {
  getSubmissions,
  updateSubmission
} from '../../../regulator/pomSubmission/store.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const url = paths.prototypeComplianceSchemeQueryResponseSignIn
// IronWave Q1 2026 (accepted in the seed)
const Q1_ID = '88888888-0001-4000-a000-000000000002'

describe('#prototypeComplianceSchemeQueryResponseSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the fake One Login sign in form with a hint on the email field', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Sign in to your GOV.UK One Login')
    expect(result).toContain('data-testid="query-response-sign-in-email"')
    expect(result).toContain('data-testid="query-response-sign-in-password"')
    expect(result).toContain('id="email-hint"')
    expect(result).toContain('aria-describedby="email-hint"')
    expect(result).not.toContain('govuk-error-summary')
  })

  test('has no service name, navigation, breadcrumbs or back link', async () => {
    const { result } = await server.inject({ method: 'GET', url })
    expect(result).not.toContain('govuk-service-navigation__service-name')
    expect(result).not.toContain('govuk-breadcrumbs')
    expect(result).not.toContain('data-testid="back-link"')
    expect(result).not.toContain('pEPR')
  })

  test('POST with empty fields shows an error summary and inline errors', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: { email: '', password: '' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain(
      'data-testid="query-response-sign-in-error-summary"'
    )
    expect(result).toContain('There is a problem')
    expect(result).toContain('href="#email"')
    expect(result).toContain('href="#password"')
    expect(result).toContain('id="email-error"')
    expect(result).toContain('id="password-error"')
    expect(result).toContain('Enter your email address')
    expect(result).toContain('Enter your password')
    expect(result).toMatch(/<title[^>]*>\s*Error: /)
  })

  test('POST with a badly formatted email explains the format and keeps the value', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url,
      payload: { email: 'not-an-email', password: 'anything' }
    })
    expect(result).toContain('Enter an email address in the correct format')
    expect(result).toContain('value="not-an-email"')
    expect(result).not.toContain('Enter your password')
  })

  test('POST with valid details redirects to the scheme’s most recent return', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url,
      payload: { email: 'someone@example.com', password: 'anything' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      pathTo(paths.prototypeComplianceSchemeQueryResponseReturnQueried, {
        year: '2026',
        quarter: 'Q2'
      })
    )
  })

  test('POST redirects to the return the regulator has queried, read from the store', async () => {
    const original = getSubmissions().find((s) => s.id === Q1_ID)
    updateSubmission(Q1_ID, { status: 'queried' })
    try {
      const { headers } = await server.inject({
        method: 'POST',
        url,
        payload: { email: 'someone@example.com', password: 'anything' }
      })
      expect(headers.location).toBe(
        pathTo(paths.prototypeComplianceSchemeQueryResponseReturnQueried, {
          year: '2026',
          quarter: 'Q1'
        })
      )
    } finally {
      updateSubmission(Q1_ID, original)
    }
  })
})
