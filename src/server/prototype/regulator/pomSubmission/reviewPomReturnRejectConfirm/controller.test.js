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
const REJECTED_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturnRejected,
  { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
)
const REJECT_CONFIRM_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
  { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
)

describe('#prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the confirmation screen with the reason carried forward from the review screen, and no radio pre-selected', async () => {
    const post = await server.inject({
      method: 'POST',
      url: REVIEW_URL,
      payload: {
        decision: 'reject',
        reason: 'Every chemistry column is shifted one place right from row 2.'
      }
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: REJECT_CONFIRM_URL,
      headers: { cookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Reject the whole Q2 2026 return?')
    )
    expect(result).toEqual(
      expect.stringMatching(
        /govuk-tag--red"[^>]*>\s*Systemic only\s*<\/strong>/
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Rejecting sends every record in IronWave Compliance&#39;s Q2 2026 return back'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('2,636 records with no issues')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'This removes 100% of the scheme&#39;s data for Q2 2026 until they resubmit.'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Every chemistry column is shifted one place right from row 2.'
      )
    )
    expect(result).toEqual(expect.stringContaining('Corrupted file'))
    expect(result).toEqual(expect.stringContaining('Template mismatch'))
    expect(result).toEqual(expect.stringContaining('Files out of sync'))
    expect(result).toEqual(expect.stringContaining('Other systemic problem'))
    expect(result).not.toEqual(
      expect.stringMatching(/type="radio"[^>]*checked/)
    )
    expect(result).not.toEqual(
      expect.stringMatching(/type="checkbox"[^>]*checked/)
    )
  })

  test('shows an error summary when the error type, reason or checkbox are missing', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: REJECT_CONFIRM_URL,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="review-pom-return-reject-confirm-error-summary"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Select the type of systemic error')
    )
    expect(result).toEqual(
      expect.stringContaining('Enter a reason for the blanket rejection')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Confirm you&#39;ve checked this can&#39;t be handled by querying individual records'
      )
    )
  })

  test('persists the rejection to the storage adapter and redirects to the rejected outcome screen', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: REJECT_CONFIRM_URL,
      payload: {
        errorType: 'template-mismatch',
        reason: 'Every chemistry column is shifted one place right from row 2.',
        confirmed: 'true'
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(REJECTED_URL)

    const { result } = await server.inject({ method: 'GET', url: REVIEW_URL })
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--red"[^>]*>\s*Rejected\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Every chemistry column is shifted one place right from row 2.'
      )
    )
  })

  test('404s for REPIC, which has no review screen in this batch', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
      { schemeId: 'repic', year: '2026', quarter: 'Q2' }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('404s for a quarter with no matching submission', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
      { schemeId: 'ironwave-compliance', year: '2027', quarter: 'Q1' }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
