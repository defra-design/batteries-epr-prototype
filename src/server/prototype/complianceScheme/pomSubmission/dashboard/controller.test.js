import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeComplianceSchemeSubmissionDashboard', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the scheme dashboard with tabs, obligation summary and details', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionDashboard
    })

    expect(statusCode).toBe(statusCodes.ok)

    const pageContent = prototypeComplianceSchemeContent.dashboard
    expect(result).toEqual(expect.stringContaining(pageContent.heading))

    expect(result).toEqual(
      expect.stringContaining('data-testid="compliance-scheme-tabs"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="compliance-scheme-tab-myScheme"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="compliance-scheme-tab-members"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="compliance-scheme-tab-submissions"')
    )

    expect(result).toEqual(
      expect.stringContaining(pageContent.obligationHeading)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-dashboard-obligation"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.obligationTargetValue)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.obligationAcceptedValue)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.obligationOutstandingValue)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-dashboard-evidence-link"'
      )
    )

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-dashboard-summary"'
      )
    )
    for (const row of pageContent.summaryRows) {
      expect(result).toEqual(expect.stringContaining(row.key))
      expect(result).toEqual(expect.stringContaining(row.value))
    }

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-dashboard-update"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-dashboard-certificate"'
      )
    )
  })

  test('shows the standard header with the service name and navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionDashboard
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).toEqual(expect.stringContaining('Home'))
    expect(result).toEqual(expect.stringContaining('Manage account'))
    expect(result).toEqual(expect.stringContaining('My profile'))
    expect(result).toEqual(expect.stringContaining('Sign out'))
  })

  test('the My scheme tab is selected and links to the dashboard, other tabs are dead links until built', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionDashboard
    })

    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionDashboard}" data-testid="compliance-scheme-tab-myScheme"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionMembers}" data-testid="compliance-scheme-tab-members"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'govuk-tabs__list-item govuk-tabs__list-item--selected'
      )
    )
  })

  test('the Home nav item is highlighted as the active page', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionDashboard
    })

    expect(result).toEqual(
      expect.stringContaining('govuk-service-navigation__item--active')
    )
  })
})
