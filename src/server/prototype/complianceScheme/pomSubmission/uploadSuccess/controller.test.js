import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const urlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionUploadSuccess
    .replace('{year}', year)
    .replace('{quarter}', quarter)

describe('#prototypeComplianceSchemeSubmissionUploadSuccess', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the heading, caption and a submission reference generated from the route', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.uploadSuccess
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="upload-success-caption">2026 batteries compliance: quarterly data'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="upload-success-reference">Submission reference: Q2-2026-IR-00417'
      )
    )
  })

  test('generates a different reference for a different quarter and year', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2027, 4)
    })

    expect(result).toEqual(
      expect.stringContaining('Submission reference: Q4-2027-IR-00417')
    )
  })

  test('renders the submission summary as a real govukSummaryList', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.uploadSuccess
    expect(result).toEqual(
      expect.stringContaining('data-testid="upload-success-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.rowsProcessedLabel)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.rowsProcessedValue)
    )
    expect(result).toEqual(expect.stringContaining(pageContent.acceptedLabel))
    expect(result).toEqual(expect.stringContaining(pageContent.acceptedValue))
    expect(result).toEqual(expect.stringContaining(pageContent.heldLabel))
    expect(result).toEqual(expect.stringContaining(pageContent.heldValue))
    expect(result).toEqual(expect.stringContaining(pageContent.submittedLabel))
    expect(result).toEqual(expect.stringContaining(pageContent.submittedValue))
  })

  test('renders the next-steps copy, dead links and a dead Continue button', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.uploadSuccess
    expect(result).toEqual(expect.stringContaining(pageContent.nextHeading))
    expect(result).toEqual(
      expect.stringContaining(pageContent.nextBody.replace(/'/g, '&#39;'))
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.evidenceNote.replace(/'/g, '&#39;'))
    )

    expect(result).toEqual(
      expect.stringContaining('href="#" data-testid="upload-success-receipt"')
    )
    expect(result).toEqual(
      expect.stringContaining('href="#" data-testid="upload-success-history"')
    )

    const continueButton = result.match(
      /<a[^>]*data-testid="upload-success-continue"[^>]*>/
    )[0]
    expect(continueButton).toEqual(expect.stringContaining('href="#"'))
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(
      expect.stringContaining('govuk-service-navigation__item')
    )
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
