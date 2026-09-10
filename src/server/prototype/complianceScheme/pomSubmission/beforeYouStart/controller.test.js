import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const urlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionBeforeYouStart
    .replace('{year}', year)
    .replace('{quarter}', quarter)

describe('#prototypeComplianceSchemeSubmissionBeforeYouStart', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the before-you-start page with the quarter and year from the route', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Before you submit your Q2 2026 return')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="before-you-start-caption">2026 batteries compliance'
      )
    )
  })

  test('is otherwise identical for a different quarter and year', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2027, 4)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Before you submit your Q4 2027 return')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="before-you-start-caption">2027 batteries compliance'
      )
    )
  })

  test('renders the body copy, real back link and check-scheme link', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.beforeYouStart
    expect(result).toEqual(
      expect.stringContaining(pageContent.optionalCheckHeading)
    )
    expect(result).toEqual(
      expect.stringContaining(
        pageContent.optionalCheckBody.replace(/'/g, '&#39;')
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionDashboard}" data-testid="before-you-start-check-scheme"`
      )
    )
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionSubmissions}"`
      )
    )
    expect(backLink).toEqual(expect.stringContaining('govuk-back-link'))
  })

  test('the Begin submission button is a Primary link to the reporting-method choice screen', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const link = result.match(
      /<a[^>]*data-testid="before-you-start-begin"[^>]*>/
    )[0]
    expect(link).not.toEqual(expect.stringContaining('govuk-button--secondary'))
    expect(link).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionReportingMethod.replace('{year}', '2026').replace('{quarter}', '2')}"`
      )
    )
    expect(result).toEqual(expect.stringContaining('Begin submission'))
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
    expect(result).not.toEqual(expect.stringContaining('My profile'))
    expect(result).not.toEqual(expect.stringContaining('Sign out'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
