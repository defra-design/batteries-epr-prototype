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
const QUERIED_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
  { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
)

describe('#prototypeRegulatorPomSubmissionReviewPomReturnQueried', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
    await server.inject({
      method: 'POST',
      url: REVIEW_URL,
      payload: {
        decision: 'query',
        reason: 'Swing of +410% is not supported by the evidence provided.'
      }
    })
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the notification banner, status tag, summary and persisted reason', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: QUERIED_URL
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-queried-banner"')
    )
    expect(result).toEqual(expect.stringContaining('Important'))
    expect(result).toEqual(expect.stringContaining('2 records queried'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange"[^>]*>\s*Queried\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining('Queried — 2 of 2,639 records')
    )
    expect(result).toEqual(
      expect.stringContaining('A. Nwosu, Environment Agency')
    )
    expect(result).toEqual(expect.stringContaining('In the service, '))
    expect(result).toEqual(expect.stringContaining('(28 days)'))
    expect(result).toEqual(
      expect.stringContaining('Stands — no resubmission needed')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Swing of +410% is not supported by the evidence provided.'
      )
    )
  })

  test('renders the queried records table from seeded member figures, each with its own existing reason', async () => {
    const { result } = await server.inject({ method: 'GET', url: QUERIED_URL })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="review-pom-return-queried-records-table"'
      )
    )
    expect(result).toEqual(expect.stringContaining('GreenLeaf Ltd'))
    expect(result).toEqual(
      expect.stringContaining('Figure looks around 10x higher')
    )
    expect(result).toEqual(expect.stringContaining('Voltguard Ltd'))
    expect(result).toEqual(
      expect.stringContaining('No supporting evidence was provided')
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*Queried\s*<\/strong>/)
    )
  })

  test('renders the download links and the related links, with the queried filename derived from the scheme and period', async () => {
    const { result } = await server.inject({ method: 'GET', url: QUERIED_URL })

    expect(result).toEqual(
      expect.stringContaining('IronWaveCompliance_Q2_2026_queried.csv')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="review-pom-return-queried-related-link-1"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="review-pom-return-queried-related-link-4"'
      )
    )
  })

  test('redirects to the review screen if visited when the submission is not queried', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
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
      paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
      { schemeId: 'repic', year: '2026', quarter: 'Q2' }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('404s for a quarter with no matching submission', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
      { schemeId: 'ironwave-compliance', year: '2027', quarter: 'Q1' }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
