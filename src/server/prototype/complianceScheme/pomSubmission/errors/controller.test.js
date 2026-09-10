import { createRequire } from 'node:module'

import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const urlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionErrors
    .replace('{year}', year)
    .replace('{quarter}', quarter)

describe('#prototypeComplianceSchemeSubmissionErrors', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the heading and caption', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.errors
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="errors-caption">2026 batteries compliance: quarterly data'
      )
    )
  })

  test('uses govukErrorSummary for the error count/filename, generated from a seeded member and the route', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const [member] = seedData.prototypeComplianceSchemeMembers
    const errorCount = seedData.prototypeComplianceSchemeUploadErrors.length
    const expectedFilename = `${member.companyName.split(' ')[0]}_Q2_2026.csv`

    const summary = result.match(
      /<div class="govuk-error-summary[^"]*"[^>]*data-testid="errors-summary"[\s\S]*?<h2 class="govuk-error-summary__title">([\s\S]*?)<\/h2>/
    )[1]
    expect(summary.trim()).toBe(
      `${errorCount} errors found in ${expectedFilename}`
    )
  })

  test('generates a different filename for a different quarter and year', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2027, 4)
    })

    const [member] = seedData.prototypeComplianceSchemeMembers
    const expectedFilename = `${member.companyName.split(' ')[0]}_Q4_2027.csv`
    expect(result).toEqual(expect.stringContaining(expectedFilename))
  })

  test('renders the three seeded errors in a real govukTable with the copy verbatim', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.errors
    expect(result).toEqual(
      expect.stringContaining('data-testid="errors-table"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.columns.error))
    expect(result).toEqual(expect.stringContaining(pageContent.columns.row))
    expect(result).toEqual(expect.stringContaining(pageContent.columns.column))
    expect(result).toEqual(
      expect.stringContaining(pageContent.columns.howToFix)
    )

    for (const error of seedData.prototypeComplianceSchemeUploadErrors) {
      expect(result).toEqual(expect.stringContaining(error.error))
      expect(result).toEqual(expect.stringContaining(String(error.row)))
      expect(result).toEqual(expect.stringContaining(error.column))
      expect(result).toEqual(
        expect.stringContaining(error.howToFix.replace(/&/g, '&amp;'))
      )
    }
  })

  test('the download button is Secondary and dead for now', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const button = result.match(/<a[^>]*data-testid="errors-download"[^>]*>/)[0]
    expect(button).toEqual(expect.stringContaining('href="#"'))
    expect(button).toEqual(expect.stringContaining('govuk-button--secondary'))
  })

  test('renders the fix heading, body, file upload and a Primary Upload button', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.errors
    expect(result).toEqual(expect.stringContaining(pageContent.fixHeading))
    expect(result).toEqual(expect.stringContaining(pageContent.fixBody))
    expect(result).toEqual(expect.stringContaining('data-testid="errors-file"'))

    const uploadButton = result.match(
      /<button[^>]*data-testid="errors-upload-submit"[^>]*>/
    )[0]
    expect(uploadButton).not.toEqual(
      expect.stringContaining('govuk-button--secondary')
    )
  })

  test('POST loops back to the uploading screen, which will advance to upload-success', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2),
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      `${paths.prototypeComplianceSchemeSubmissionUploading
        .replace('{year}', '2026')
        .replace('{quarter}', '2')}?next=success`
    )
  })

  test('back link goes to the bulk-upload screen', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionBulkUpload.replace('{year}', '2026').replace('{quarter}', '2')}"`
      )
    )
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
