import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'
import { config } from '../../config/config.js'

describe('#accountController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the account chrome with all section headings', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.account
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.account({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining(pageContent.sections.company.title)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.sections.contact.title)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.sections.brandNames.title)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.sections.submissions.title)
    )
  })

  test('emits a page-payload with sign-in, dashboard, period and section copy', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.account
    })

    expect(result).toEqual(expect.stringContaining('id="page-payload"'))
    expect(result).toEqual(
      expect.stringContaining(`"signInUrl":"${paths.signIn}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(`"dashboardUrl":"${paths.dashboard}"`)
    )
    expect(result).toEqual(expect.stringContaining('"compliancePeriod":"2026"'))
    expect(result).toEqual(expect.stringContaining('"sections"'))
  })

  test('edit links carry a return querystring back to /account', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.account
    })

    const expected = `?return=${encodeURIComponent(paths.account)}`
    expect(result).toEqual(
      expect.stringContaining(`${paths.onboardingCompanyDetails}${expected}`)
    )
    expect(result).toEqual(
      expect.stringContaining(`${paths.onboardingBrandNames}${expected}`)
    )
  })

  test('reset section is present in development mode', async () => {
    const original = config.get('isProduction')
    config.set('isProduction', false)
    try {
      const { result } = await server.inject({
        method: 'GET',
        url: paths.account
      })
      expect(result).toEqual(
        expect.stringContaining('data-testid="account-reset-confirm"')
      )
    } finally {
      config.set('isProduction', original)
    }
  })

  test('reset section is hidden in production mode', async () => {
    const original = config.get('isProduction')
    config.set('isProduction', true)
    try {
      const { result } = await server.inject({
        method: 'GET',
        url: paths.account
      })
      expect(result).not.toEqual(
        expect.stringContaining('data-testid="account-reset-confirm"')
      )
    } finally {
      config.set('isProduction', original)
    }
  })
})
