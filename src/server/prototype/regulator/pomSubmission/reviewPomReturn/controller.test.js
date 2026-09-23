import { differenceInCalendarDays, parseISO } from 'date-fns'

import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const IRONWAVE_Q2_2026_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionReviewPomReturn,
  { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
)

describe('#prototypeRegulatorPomSubmissionReviewPomReturn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the return summary, status tag and status steps from seeded data', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: IRONWAVE_Q2_2026_URL
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('IronWave Compliance — Q2 2026 return')
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue"[^>]*>\s*Received\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance submitted their Q2 2026 return on 8 August 2026'
      )
    )

    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-status-steps"')
    )
    expect(result).toEqual(expect.stringContaining('Submitted'))
    expect(result).toEqual(expect.stringContaining('Automated checks passed'))
    expect(result).toEqual(expect.stringContaining('Under regulator review'))
    expect(result).toEqual(expect.stringContaining('Since 9 August 2026'))
    expect(result).toEqual(expect.stringContaining('Decision'))

    const expectedLockInDays = differenceInCalendarDays(
      parseISO('2026-09-30'),
      new Date()
    )
    expect(result).toEqual(
      expect.stringContaining(`Locks in ${expectedLockInDays} days`)
    )
    expect(result).toEqual(
      expect.stringContaining('figures lock on 30 September 2026')
    )
  })

  test('renders the summary list from seeded data, including derived member counts and swing categories', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: IRONWAVE_Q2_2026_URL
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-summary"')
    )
    expect(result).toEqual(expect.stringContaining('623,073 tonnes'))
    expect(result).toEqual(expect.stringContaining('5 of 5'))
    expect(result).toEqual(
      expect.stringContaining('General use, Light means of transport')
    )
    expect(result).toEqual(
      expect.stringContaining('Michael Osei, michael.osei@ironwave.co.uk')
    )
  })

  test('renders all 8 related links, with the first two wired to the battery sales data submission tabs and the rest dead for now', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: IRONWAVE_Q2_2026_URL
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-related-links"')
    )

    const batterySalesDataSubmissionUrl = pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId: 'ironwave-compliance' }
    )

    const compareReturnsLinkTag = result.match(
      /<a[^>]*data-testid="review-pom-return-related-link-1"[^>]*>/
    )[0]
    expect(compareReturnsLinkTag).toEqual(
      expect.stringContaining(
        `href="${batterySalesDataSubmissionUrl}#compare-returns"`
      )
    )

    const indicativeObligationLinkTag = result.match(
      /<a[^>]*data-testid="review-pom-return-related-link-2"[^>]*>/
    )[0]
    expect(indicativeObligationLinkTag).toEqual(
      expect.stringContaining(
        `href="${batterySalesDataSubmissionUrl}#indicative-obligation"`
      )
    )

    for (let i = 3; i <= 8; i += 1) {
      const linkTag = result.match(
        new RegExp(
          `<a[^>]*data-testid="review-pom-return-related-link-${i}"[^>]*>`
        )
      )[0]
      expect(linkTag).toEqual(expect.stringContaining('href="#"'))
    }
    expect(result).toEqual(
      expect.stringContaining('Compare figures — 3-year view and anomaly flags')
    )
    expect(result).toEqual(expect.stringContaining('View amendment history'))
  })

  test('renders the decision radios with none pre-selected, and a reason textarea', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: IRONWAVE_Q2_2026_URL
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-decision-accept"')
    )
    expect(result).toEqual(expect.stringContaining('Accept the return'))
    expect(result).toEqual(expect.stringContaining('Query one or more figures'))
    expect(result).toEqual(
      expect.stringContaining('Reject the whole return (systemic errors only)')
    )
    expect(result).not.toEqual(expect.stringContaining('checked'))

    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-reason"')
    )
    expect(result).toEqual(expect.stringContaining('Reason for your decision'))
  })

  test('shows an error summary and inline errors when no decision is selected and the reason is empty', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: IRONWAVE_Q2_2026_URL,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="review-pom-return-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Select whether to accept, query or reject the return'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Enter a reason for your decision')
    )
  })

  test('shows only the reason error when a decision is selected but the reason is empty', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: IRONWAVE_Q2_2026_URL,
      payload: { decision: 'query', reason: '' }
    })

    expect(result).toEqual(
      expect.stringContaining('Enter a reason for your decision')
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'Select whether to accept, query or reject the return'
      )
    )
  })

  test('persists an accept decision to the storage adapter and redirects to the accepted outcome screen', async () => {
    const acceptedUrl = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnAccepted,
      { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
    )

    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: IRONWAVE_Q2_2026_URL,
      payload: {
        decision: 'accept',
        reason: 'All figures reconcile against last quarter.'
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(acceptedUrl)

    const { result } = await server.inject({
      method: 'GET',
      url: IRONWAVE_Q2_2026_URL
    })
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green"[^>]*>\s*Accepted\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining('All figures reconcile against last quarter.')
    )
  })

  test('persists a query decision to the storage adapter and redirects to the queried outcome screen', async () => {
    const queriedUrl = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
      { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
    )

    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: IRONWAVE_Q2_2026_URL,
      payload: {
        decision: 'query',
        reason: 'Swing of +410% is not supported by the evidence provided.'
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(queriedUrl)

    const { result } = await server.inject({
      method: 'GET',
      url: IRONWAVE_Q2_2026_URL
    })
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange"[^>]*>\s*Queried\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Swing of +410% is not supported by the evidence provided.'
      )
    )
  })

  test('redirects a reject decision to the reject-confirm screen without persisting anything, carrying the reason forward', async () => {
    const rejectConfirmUrl = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
      { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
    )

    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: IRONWAVE_Q2_2026_URL,
      payload: {
        decision: 'reject',
        reason: 'Every chemistry column is shifted one place right from row 2.'
      }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(rejectConfirmUrl)

    const cookie = headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: rejectConfirmUrl,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'Every chemistry column is shifted one place right from row 2.'
      )
    )
  })

  test('404s for REPIC, which has no review screen in this batch', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
      schemeId: 'repic',
      year: '2026',
      quarter: 'Q2'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('404s for a quarter with no matching submission', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
      schemeId: 'ironwave-compliance',
      year: '2027',
      quarter: 'Q1'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('renders with no lock tag or warning for a historical quarter that has no lockOn', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
      schemeId: 'ironwave-compliance',
      year: '2026',
      quarter: 'Q1'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="review-pom-return-lock-tag"')
    )
  })

  test('POST 404s for REPIC, which has no review screen in this batch', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
      schemeId: 'repic',
      year: '2026',
      quarter: 'Q2'
    })
    const { statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: { decision: 'accept', reason: 'n/a' }
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST 404s for a quarter with no matching submission', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
      schemeId: 'ironwave-compliance',
      year: '2027',
      quarter: 'Q1'
    })
    const { statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: { decision: 'accept', reason: 'n/a' }
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
