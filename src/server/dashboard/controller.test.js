import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#dashboardController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the dashboard chrome with all four cards', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.dashboard
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.dashboard({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining(pageContent.cards.registration.title)
    )
    expect(result).toEqual(expect.stringContaining(pageContent.cards.fee.title))
    expect(result).toEqual(
      expect.stringContaining(pageContent.cards.annualReturn.title)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.cards.activity.title)
    )

    for (const id of [
      'dashboard-loading',
      'dashboard-content',
      'card-registration-status',
      'card-fee-status',
      'card-annual-return-status',
      'card-activity-list'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
  })

  test('does not render inline account or sign-out links (now in nav bar)', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.dashboard
    })

    expect(result).not.toEqual(
      expect.stringContaining('data-testid="dashboard-account-link"')
    )
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="dashboard-sign-out"')
    )
  })

  test('emits a page-payload with sign-in, onboarding, payment, period, and card copy', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.dashboard
    })

    expect(result).toEqual(expect.stringContaining('id="page-payload"'))
    expect(result).toEqual(
      expect.stringContaining(`"signInUrl":"${paths.signIn}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"onboardingStartUrl":"${paths.onboardingCompanyDetails}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`"payServiceChargeUrl":"${paths.serviceCharge}"`)
    )
    expect(result).toEqual(expect.stringContaining('"compliancePeriod":"2026"'))
    expect(result).toEqual(expect.stringContaining('"cards"'))
  })
})
