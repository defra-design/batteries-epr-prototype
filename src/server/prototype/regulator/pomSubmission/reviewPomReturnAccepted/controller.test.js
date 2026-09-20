import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const REVIEW_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturn,
  {
    schemeId: 'ironwave-compliance',
    year: '2026',
    quarter: 'Q2'
  }
)
const ACCEPTED_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturnAccepted,
  { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
)

describe('#prototypeRegulatorPomSubmissionReviewPomReturnAccepted', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
    await server.inject({
      method: 'POST',
      url: REVIEW_URL,
      payload: {
        decision: 'accept',
        reason: 'All figures reconcile against last quarter.'
      }
    })
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the success banner, status tag, summary and persisted reason', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: ACCEPTED_URL
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-accepted-banner"')
    )
    expect(result).toEqual(expect.stringContaining('Success'))
    expect(result).toEqual(expect.stringContaining('Acceptance recorded'))
    expect(result).toEqual(
      expect.stringContaining('IronWave Compliance — Q2 2026 return')
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green"[^>]*>\s*Accepted\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance submitted their Q2 2026 return on 8 August 2026'
      )
    )
    expect(result).toEqual(expect.stringContaining('623,073 tonnes'))
    expect(result).toEqual(expect.stringContaining('5 of 5'))
    expect(result).toEqual(
      expect.stringContaining('Michael Osei, michael.osei@ironwave.co.uk')
    )
    expect(result).toEqual(
      expect.stringContaining('All figures reconcile against last quarter.')
    )
  })

  test('renders only the first 3 related links', async () => {
    const { result } = await server.inject({ method: 'GET', url: ACCEPTED_URL })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="review-pom-return-accepted-related-link-1"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="review-pom-return-accepted-related-link-3"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="review-pom-return-accepted-related-link-4"'
      )
    )
  })

  test('redirects to the review screen if visited when the submission is not accepted', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnAccepted,
      { schemeId: 'ironwave-compliance', year: '2025', quarter: 'Q3' }
    )
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
        schemeId: 'ironwave-compliance',
        year: '2025',
        quarter: 'Q3'
      })
    )
  })

  test('404s for REPIC, which has no review screen in this batch', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnAccepted,
      { schemeId: 'repic', year: '2026', quarter: 'Q2' }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('404s for a quarter with no matching submission', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnAccepted,
      { schemeId: 'ironwave-compliance', year: '2027', quarter: 'Q1' }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
