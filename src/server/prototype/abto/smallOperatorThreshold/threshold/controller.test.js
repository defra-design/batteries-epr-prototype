import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeAbtoContent } from '../../../../../config/prototype-abto-content.js'
import { getThreshold } from '../store.js'

describe('#prototypeAbtoThreshold', () => {
  let server
  let result
  let statusCode

  beforeAll(async () => {
    server = await initialiseServer()
    ;({ result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeAbtoThreshold
    }))
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the heading, banner and running totals heading', () => {
    const content = prototypeAbtoContent.threshold
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain(content.heading.replace("'", '&#39;'))
    expect(result).toContain('data-testid="abto-threshold-banner"')
    expect(result).toContain(content.banner.heading)
    expect(result).toContain(content.totalsHeading)
  })

  test('takes the pay-by date and day count from the seed, not hardcoded copy', () => {
    expect(getThreshold().payBy).toBe('2026-10-03T00:00:00Z')
    expect(result).toContain('within 28 days, by 3 October 2026.')
  })

  test('renders the totals table with seeded figures and coloured status tags', () => {
    const { totals } = prototypeAbtoContent
    expect(result).toContain('data-testid="abto-totals-table"')
    for (const category of getThreshold().categories) {
      expect(result).toContain(category.name)
      expect(result).toContain(`${category.thresholdTonnes.toFixed(3)} tonnes`)
      expect(result).toContain(`${category.totalTonnes.toFixed(3)} tonnes`)
    }
    expect(result).toContain('15.000 tonnes')
    expect(result).toContain('18.400 tonnes')
    expect(result).toContain('150.000 tonnes')
    expect(result).toContain('96.300 tonnes')
    expect(result).toMatch(
      new RegExp(`govuk-tag--red[^>]*>\\s*${totals.status.exceeded}`)
    )
    expect(result).toMatch(
      new RegExp(`govuk-tag--green[^>]*>\\s*${totals.status.within}`)
    )
  })

  test('shows the explanation, balance due and pay button', () => {
    expect(result).toContain('exceeds 15.000 tonnes in an approval year')
    expect(result).toContain('Balance due: £250.00')
    expect(result).toContain(prototypeAbtoContent.threshold.payAction)
  })

  test('uses account-area navigation without My profile, and no breadcrumbs', () => {
    expect(result).toContain('Manage account')
    expect(result).toContain('Sign out')
    expect(result).not.toContain('My profile')
    expect(result).not.toContain('govuk-breadcrumbs')
  })

  test('has a back link to the email', () => {
    expect(result).toMatch(
      new RegExp(
        `<a href="${paths.prototypeAbtoThresholdEmail}"[^>]*class="govuk-back-link"`
      )
    )
  })
})
