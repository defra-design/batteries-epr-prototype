import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const urlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionBulkUpload
    .replace('{year}', year)
    .replace('{quarter}', quarter)

const BOUNDARY = '----testBoundary'

const multipartPayload = ({ withFile }) => {
  const filePart = withFile
    ? [
        `--${BOUNDARY}`,
        'Content-Disposition: form-data; name="batteryDataFile"; filename="data.csv"',
        'Content-Type: text/csv',
        '',
        'chemistry,tonnes',
        'lithium-ion,1.2',
        ''
      ].join('\r\n')
    : [
        `--${BOUNDARY}`,
        'Content-Disposition: form-data; name="batteryDataFile"; filename=""',
        'Content-Type: application/octet-stream',
        '',
        ''
      ].join('\r\n')

  const supportingPart = [
    `--${BOUNDARY}`,
    'Content-Disposition: form-data; name="supportingFile"; filename=""',
    'Content-Type: application/octet-stream',
    '',
    ''
  ].join('\r\n')

  return `${filePart}\r\n${supportingPart}\r\n--${BOUNDARY}--\r\n`
}

const injectMultipart = (server, url, { withFile }) =>
  server.inject({
    method: 'POST',
    url,
    payload: multipartPayload({ withFile }),
    headers: {
      'content-type': `multipart/form-data; boundary=${BOUNDARY}`
    }
  })

describe('#prototypeComplianceSchemeSubmissionBulkUpload', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the upload form with both file inputs', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Upload battery data'))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="bulk-upload-caption">2026 batteries compliance: quarterly data'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="bulk-upload-file"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="bulk-upload-supporting-file"')
    )
    expect(result).toEqual(expect.stringContaining('type="file"'))
  })

  test('renders the body copy and back link to the reporting-method screen', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.bulkUpload
    expect(result).toEqual(expect.stringContaining(pageContent.templateLink))
    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="bulk-upload-template-link"'
      )
    )
    expect(result).toEqual(expect.stringContaining(pageContent.tonnesWarning))
    expect(result).toEqual(
      expect.stringContaining(pageContent.wasteCollectionNote)
    )
    expect(result).toEqual(expect.stringContaining(pageContent.apiNote))
    expect(result).toEqual(
      expect.stringContaining(pageContent.supportingHeading)
    )
    expect(result).toEqual(expect.stringContaining(pageContent.supportingBody))

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionReportingMethod.replace('{year}', '2026').replace('{quarter}', '2')}"`
      )
    )
  })

  test('attaches the supporting-file explanatory text as a real govukHint, not a floating paragraph', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const pageContent = prototypeComplianceSchemeContent.bulkUpload
    const hint = result.match(
      /<div id="supportingFile-hint" class="govuk-hint">([^<]*)<\/div>/
    )[0]
    expect(hint).toEqual(expect.stringContaining(pageContent.supportingBody))

    const input = result.match(/<input[^>]*id="supportingFile"[^>]*>/)[0]
    expect(input).toEqual(
      expect.stringContaining('aria-describedby="supportingFile-hint"')
    )
  })

  test('POST without a file renders an error summary and inline error', async () => {
    const { result, statusCode } = await injectMultipart(
      server,
      urlFor(2026, 2),
      { withFile: false }
    )

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.bulkUpload
    expect(result).toEqual(
      expect.stringContaining('data-testid="bulk-upload-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.error.message))
    expect(result).toEqual(expect.stringContaining('href="#batteryDataFile"'))
  })

  test('POST with a file selected redirects to the uploading screen', async () => {
    const { statusCode, headers } = await injectMultipart(
      server,
      urlFor(2026, 2),
      { withFile: true }
    )

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      paths.prototypeComplianceSchemeSubmissionUploading
        .replace('{year}', '2026')
        .replace('{quarter}', '2')
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
