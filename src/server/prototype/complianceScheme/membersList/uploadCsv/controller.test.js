import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const BOUNDARY = '----testBoundary'

const multipartPayload = ({ withFile }) => {
  const filePart = withFile
    ? [
        `--${BOUNDARY}`,
        'Content-Disposition: form-data; name="membersFile"; filename="members.csv"',
        'Content-Type: text/csv',
        '',
        'companyName,companyRegistrationNo',
        'Halton Battery Processing Ltd,07456123',
        ''
      ].join('\r\n')
    : [
        `--${BOUNDARY}`,
        'Content-Disposition: form-data; name="membersFile"; filename=""',
        'Content-Type: application/octet-stream',
        '',
        ''
      ].join('\r\n')

  return `${filePart}\r\n--${BOUNDARY}--\r\n`
}

const injectMultipart = (server, { withFile }) =>
  server.inject({
    method: 'POST',
    url: paths.prototypeMembersListUploadCsv,
    payload: multipartPayload({ withFile }),
    headers: {
      'content-type': `multipart/form-data; boundary=${BOUNDARY}`
    }
  })

describe('#prototypeMembersListUploadCsv', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the upload form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListUploadCsv
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Upload a CSV file'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="upload-csv-file"')
    )
    expect(result).toEqual(expect.stringContaining('type="file"'))
  })

  test('renders the intro and back link to how-to-send', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListUploadCsv
    })

    const pageContent = prototypeComplianceSchemeContent.membersList.uploadCsv
    expect(result).toEqual(expect.stringContaining(pageContent.intro))

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(`href="${paths.prototypeMembersListHowToSend}"`)
    )
  })

  test('POST without a file renders an error summary and inline error', async () => {
    const { result, statusCode } = await injectMultipart(server, {
      withFile: false
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.membersList.uploadCsv
    expect(result).toEqual(
      expect.stringContaining('data-testid="upload-csv-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.error.message))
    expect(result).toEqual(expect.stringContaining('href="#membersFile"'))
  })

  test('POST with a file selected persists the filename and routes to review-upload', async () => {
    const { result, statusCode } = await injectMultipart(server, {
      withFile: true
    })

    expect(statusCode).toBe(statusCodes.ok)
    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'save',
      savedFields: { sendMethod: 'csv', uploadedFileName: 'members.csv' },
      nextStep: paths.prototypeMembersListReviewUpload
    })
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListUploadCsv
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListUploadCsv
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
