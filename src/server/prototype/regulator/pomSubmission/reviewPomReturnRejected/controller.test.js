import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const params = { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
const CONFIRM_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
  params
)
const REJECTED_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturnRejected,
  params
)
const REASON =
  'Every chemistry column is shifted one place right from row 2, so no figure in the file can be trusted.'

describe('#prototypeRegulatorPomSubmissionReviewPomReturnRejected', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('redirects to the review screen while the return has not been rejected', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: REJECTED_URL
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, params)
    )
  })

  test('renders the rejection banner, red tag and persisted decision after a confirmed rejection', async () => {
    await server.inject({
      method: 'POST',
      url: CONFIRM_URL,
      payload: {
        errorType: 'template-mismatch',
        reason: REASON,
        confirmed: 'true'
      }
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: REJECTED_URL
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-rejected-banner"')
    )
    expect(result).toEqual(expect.stringContaining('Important'))
    expect(result).toEqual(expect.stringContaining('Rejection recorded'))
    expect(result).toEqual(
      expect.stringContaining('IronWave Compliance — Q2 2026 return')
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--red"[^>]*>\s*Rejected\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'The whole Q2 2026 return has been sent back to IronWave Compliance'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Q3 2026 can still be submitted on time')
    )
    expect(result).toEqual(
      expect.stringContaining(`Systemic — template mismatch. ${REASON}`)
    )
    expect(result).toEqual(
      expect.stringContaining('A. Nwosu, Environment Agency')
    )
    expect(result).toEqual(expect.stringContaining('(28 days)'))
    expect(result).toEqual(
      expect.stringMatching(/Decided on[\s\S]*\d{1,2} \w+ \d{4}, \d{2}:\d{2}/)
    )
  })

  test('renders the related links, wiring only the back link', async () => {
    const { result } = await server.inject({ method: 'GET', url: REJECTED_URL })

    expect(result).toEqual(expect.stringContaining('View submission files (4)'))
    for (const id of ['files', 'timeline']) {
      const tag = result.match(
        new RegExp(
          `<a[^>]*data-testid="review-pom-return-rejected-${id}-link"[^>]*>`
        )
      )[0]
      expect(tag).toEqual(expect.stringContaining('href="#"'))
    }
    const back = result.match(
      /<a[^>]*data-testid="review-pom-return-rejected-dashboard-link"[^>]*>/
    )[0]
    expect(back).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPomSubmissionDashboard}#pom-submissions"`
      )
    )
  })

  test('rolls Q4 over into Q1 of the following year in the "does not block" copy', async () => {
    const q4Params = {
      schemeId: 'ironwave-compliance',
      year: '2025',
      quarter: 'Q4'
    }
    await server.inject({
      method: 'POST',
      url: pathTo(
        paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
        q4Params
      ),
      payload: {
        errorType: 'corrupted-file',
        reason: REASON,
        confirmed: 'true'
      }
    })

    const { result } = await server.inject({
      method: 'GET',
      url: pathTo(
        paths.prototypeRegulatorPomSubmissionReviewPomReturnRejected,
        q4Params
      )
    })

    expect(result).toEqual(
      expect.stringContaining('Q1 2026 can still be submitted on time')
    )
  })

  test('404s for REPIC and for a quarter with no submission', async () => {
    for (const bad of [
      { ...params, schemeId: 'repic' },
      { ...params, year: '2027', quarter: 'Q1' }
    ]) {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: pathTo(
          paths.prototypeRegulatorPomSubmissionReviewPomReturnRejected,
          bad
        )
      })
      expect(statusCode).toBe(statusCodes.notFound)
    }
  })
})
