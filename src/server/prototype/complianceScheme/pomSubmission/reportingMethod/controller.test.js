import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const urlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionReportingMethod
    .replace('{year}', year)
    .replace('{quarter}', quarter)

describe('#prototypeComplianceSchemeSubmissionReportingMethod', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the form with neither radio pre-selected', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('How do you want to report your battery data?')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="reporting-method-caption">2026 batteries compliance: quarterly data'
      )
    )

    const single = result.match(
      /<input[^>]*data-testid="reporting-method-single"[^>]*>/
    )[0]
    const bulk = result.match(
      /<input[^>]*data-testid="reporting-method-bulk"[^>]*>/
    )[0]
    expect(single).not.toEqual(expect.stringContaining('checked'))
    expect(bulk).not.toEqual(expect.stringContaining('checked'))
  })

  test('renders the guidance link, hints and back link to before-you-start', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.reportingMethod
    expect(result).toEqual(expect.stringContaining(pageContent.guidanceLink))
    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="reporting-method-guidance-link"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        pageContent.singleMemberHint.replace(/'/g, '&#39;')
      )
    )
    expect(result).toEqual(expect.stringContaining(pageContent.bulkUploadHint))

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionBeforeYouStart.replace('{year}', '2026').replace('{quarter}', '2')}"`
      )
    )
  })

  test('POST without a selection re-renders with an error summary and inline error', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2),
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.reportingMethod
    expect(result).toEqual(
      expect.stringContaining('data-testid="reporting-method-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.error.message))
    expect(result).toEqual(expect.stringContaining('href="#reportingMethod"'))
  })

  test('POST with "single" re-renders the page, persists the choice, and routes nowhere for now', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2),
      payload: { reportingMethod: 'single' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="reporting-method-error-summary"')
    )

    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'save',
      year: '2026',
      quarter: '2',
      savedFields: { reportingMethod: 'single' },
      nextStep: null
    })
  })

  test('POST with "bulk" persists the choice and gives a nextStep to the bulk-upload screen', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2),
      payload: { reportingMethod: 'bulk' }
    })

    expect(statusCode).toBe(statusCodes.ok)

    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'save',
      year: '2026',
      quarter: '2',
      savedFields: { reportingMethod: 'bulk' },
      nextStep: paths.prototypeComplianceSchemeSubmissionBulkUpload
        .replace('{year}', '2026')
        .replace('{quarter}', '2')
    })
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
