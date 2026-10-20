import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { getSubmissions, resetStore } from '../store.js'

const params = { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
const reviewUrl = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturn,
  params
)
const url = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
  params
)

const resubmitBy = {
  'respondBy-day': '28',
  'respondBy-month': '8',
  'respondBy-year': '2026',
  respondByTime: '12pm'
}

describe('#prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  beforeEach(() => {
    resetStore()
  })

  const get = (headers) => server.inject({ method: 'GET', url, headers })
  const post = (payload) => server.inject({ method: 'POST', url, payload })
  const status = () =>
    getSubmissions().find(
      (s) =>
        s.schemeId === 'ironwave-compliance' &&
        s.quarter === 'Q2' &&
        s.compliancePeriodYear === '2026'
    ).status

  test('H1 with a Whole return tag, the intro, the warning and a Cancel link back to the review', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Reject the whole Q2 2026 return?')
    )
    expect(result).toMatch(/govuk-tag--red[^>]*>\s*Whole return\s*</)
    expect(result).toEqual(
      expect.stringContaining(
        'The whole return goes back to IronWave Compliance to correct and resubmit.'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance’s Q2 2026 data won’t be used for national compilation until they resubmit.'
      )
    )
    const cancel = result.match(/<a[^>]*data-testid="reject-cancel"[^>]*>/)[0]
    expect(cancel).toEqual(expect.stringContaining(`href="${reviewUrl}"`))
  })

  test('the four reasons are radios with their hints and none is pre-selected', async () => {
    const { result } = await get()

    for (const value of [
      'undeclaredChange',
      'schemeRequested',
      'tooManyErrors',
      'other'
    ]) {
      const radio = result.match(
        new RegExp(`<input[^>]*data-testid="reject-type-${value}"[^>]*>`)
      )[0]
      expect(radio).not.toEqual(expect.stringContaining('checked'))
    }
    expect(result).toEqual(
      expect.stringContaining(
        'Figures for one or more producers differ from the earlier return'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Required. IronWave Compliance sees this in the service.'
      )
    )
    expect(result).toEqual(expect.stringContaining('name="respondBy-day"'))
    expect(result).toEqual(expect.stringContaining('Reject return'))
  })

  test('submitting nothing shows an error summary and inline errors', async () => {
    const { result, statusCode } = await post({})

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="reject-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('href="#errorType"'))
    expect(result).toEqual(expect.stringContaining('href="#details"'))
    expect(result).toEqual(expect.stringContaining('href="#respondBy-day"'))
    expect(status()).toBe('received')
  })

  test('a bad time and an over-long detail are reported and typed values kept', async () => {
    const time = await post({
      errorType: 'other',
      details: 'Kept',
      ...resubmitBy,
      respondByTime: 'later'
    })
    expect(time.result).toEqual(expect.stringContaining('Enter a time'))
    expect(time.result).toEqual(expect.stringContaining('Kept'))

    const long = await post({
      errorType: 'other',
      details: 'a'.repeat(1001),
      ...resubmitBy
    })
    expect(long.result).toEqual(
      expect.stringContaining('Details must be 1000 characters or fewer')
    )
  })

  test('rejecting records the decision, and the review page shows the rejection', async () => {
    const { statusCode, headers } = await post({
      errorType: 'schemeRequested',
      details:
        'You told us the GreenLeaf Ltd figures were entered in kilograms.',
      ...resubmitBy
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(reviewUrl)
    expect(status()).toBe('rejected')

    const { result } = await server.inject({ method: 'GET', url: reviewUrl })
    expect(result).toEqual(expect.stringContaining('Return rejected'))
    expect(result.indexOf('Return rejected')).toBeLessThan(
      result.indexOf('>IronWave Compliance — Q2 2026 return')
    )
    expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Rejected\s*</)
    const summary = result
      .split('data-testid="review-summary"')[1]
      .split('</dl>')[0]
    expect(summary).toEqual(expect.stringContaining('Rejected — whole return'))
    expect(summary).toEqual(
      expect.stringContaining('The scheme asked for it to be rejected')
    )
    expect(summary).toEqual(expect.stringContaining('entered in kilograms'))
    expect(summary).toEqual(expect.stringContaining('12pm, 28 August 2026'))
    expect(summary).toEqual(expect.stringContaining('A. Nwosu'))
    expect(result).toEqual(
      expect.stringContaining('The submitted files are kept as they were.')
    )
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="review-decision-form"')
    )
  })

  test('what was typed on the review screen carries over, once', async () => {
    const review = await server.inject({
      method: 'POST',
      url: reviewUrl,
      payload: {
        decision: 'reject',
        reason: 'Figures entered in kilograms',
        'respondBy-day': '28',
        'respondBy-month': '8',
        'respondBy-year': '2026',
        respondByTime: '12pm'
      }
    })
    const cookie = review.headers['set-cookie']
      .map((entry) => entry.split(';')[0])
      .join('; ')

    const first = await get({ cookie })
    expect(first.result).toEqual(
      expect.stringContaining('Figures entered in kilograms')
    )
    expect(first.result).toMatch(/name="respondBy-day"[^>]*value="28"/)
    expect(first.result).toMatch(/name="respondByTime"[^>]*value="12pm"/)
  })

  test('an unbuilt scheme or unknown return is a 404', async () => {
    const unbuilt = await server.inject({
      method: 'GET',
      url: pathTo(
        paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
        { ...params, schemeId: 'repic' }
      )
    })
    expect(unbuilt.statusCode).toBe(statusCodes.notFound)

    const unknown = await server.inject({
      method: 'GET',
      url: pathTo(
        paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
        { ...params, year: '2019' }
      )
    })
    expect(unknown.statusCode).toBe(statusCodes.notFound)
  })
})
