import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import {
  prototypeComplianceSchemeContent,
  PROTOTYPE_COMPLIANCE_SCHEME_NAME
} from '../../../../../config/prototype-compliance-scheme-content.js'

const urlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionUploading
    .replace('{year}', year)
    .replace('{quarter}', quarter)

const errorsUrlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionErrors
    .replace('{year}', year)
    .replace('{quarter}', quarter)

const successUrlFor = (year, quarter) =>
  paths.prototypeComplianceSchemeSubmissionUploadSuccess
    .replace('{year}', year)
    .replace('{quarter}', quarter)

describe('#prototypeComplianceSchemeSubmissionUploading', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the caption, heading and body copy', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.uploading
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="uploading-caption">2026 batteries compliance: quarterly data'
      )
    )
    expect(result).toEqual(expect.stringContaining(pageContent.body1))
    expect(result).toEqual(expect.stringContaining(pageContent.body2))
    expect(result).toEqual(
      expect.stringContaining('data-testid="uploading-spinner"')
    )
  })

  test('renders the checking line first, with the filename generated from the scheme name and route', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const schemeToken = PROTOTYPE_COMPLIANCE_SCHEME_NAME.split(' ')[0]
    const expectedFilename = `${schemeToken}_Q2_2026.csv`
    const pageContent = prototypeComplianceSchemeContent.uploading
    const expectedBody = pageContent.checkingBodyTemplate.replace(
      '{filename}',
      expectedFilename
    )

    expect(result).toEqual(
      expect.stringContaining(
        `data-testid="uploading-checking">${expectedBody}`
      )
    )

    const checkingIndex = result.indexOf('data-testid="uploading-checking"')
    const body1Index = result.indexOf(pageContent.body1)
    expect(checkingIndex).toBeGreaterThan(-1)
    expect(body1Index).toBeGreaterThan(checkingIndex)
  })

  test('generates a different filename for a different quarter and year', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2027, 4)
    })

    const schemeToken = PROTOTYPE_COMPLIANCE_SCHEME_NAME.split(' ')[0]
    expect(result).toEqual(
      expect.stringContaining(`${schemeToken}_Q4_2027.csv`)
    )
  })

  test('has no back link', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(result).not.toEqual(
      expect.stringContaining('data-testid="back-link"')
    )
  })

  test('has a meta-refresh fallback and a visible Continue link to the errors screen', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const target = errorsUrlFor(2026, 2)
    expect(result).toEqual(
      expect.stringContaining(
        `<meta http-equiv="refresh" content="5;url=${target}">`
      )
    )

    const continueLink = result.match(
      /<a[^>]*data-testid="uploading-continue"[^>]*>/
    )[0]
    expect(continueLink).toEqual(expect.stringContaining(`href="${target}"`))
  })

  test('embeds an auto-advance page payload for the client to act on', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'auto-advance',
      nextStep: errorsUrlFor(2026, 2)
    })
  })

  test('defaults to advancing to the errors screen when reached directly (first upload attempt)', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const target = errorsUrlFor(2026, 2)
    expect(result).toEqual(
      expect.stringContaining(
        `<meta http-equiv="refresh" content="5;url=${target}">`
      )
    )
  })

  test('advances to upload-success when reached with ?next=success (retry from the errors screen)', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${urlFor(2026, 2)}?next=success`
    })

    const target = successUrlFor(2026, 2)
    expect(result).toEqual(
      expect.stringContaining(
        `<meta http-equiv="refresh" content="5;url=${target}">`
      )
    )

    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({ target: 'auto-advance', nextStep: target })
  })

  test('ignores an unrecognised next value and falls back to errors', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${urlFor(2026, 2)}?next=nonsense`
    })

    const target = errorsUrlFor(2026, 2)
    expect(result).toEqual(
      expect.stringContaining(
        `<meta http-equiv="refresh" content="5;url=${target}">`
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
