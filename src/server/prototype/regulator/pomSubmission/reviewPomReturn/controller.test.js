import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import {
  getDraftQueries,
  getMemberFigures,
  getQueriedRecords,
  getSubmissions,
  removeDraftQuery,
  resetStore,
  updateSubmission
} from '../store.js'

const params = { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
const url = pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, params)

const respondBy = {
  'respondBy-day': '21',
  'respondBy-month': '8',
  'respondBy-year': '2026',
  respondByTime: '12pm'
}

describe('#prototypeRegulatorPomSubmissionReviewPomReturn', () => {
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

  const get = () => server.inject({ method: 'GET', url })
  const post = (payload) => server.inject({ method: 'POST', url, payload })
  const currentStatus = () =>
    getSubmissions().find(
      (s) =>
        s.schemeId === 'ironwave-compliance' &&
        s.compliancePeriodYear === '2026' &&
        s.quarter === 'Q2'
    ).status

  describe('submitted state', () => {
    test('H1, status tag, intro, late tag and the lock note', async () => {
      const { result, statusCode } = await get()

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('>IronWave Compliance — Q2 2026 return')
      )
      expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Received\s*</)
      expect(result).toEqual(
        expect.stringContaining(
          'Submitted on 8 August 2026 — 8 days after the 31 July deadline.'
        )
      )
      expect(result).toMatch(/govuk-tag--red">\s*Submitted late\s*</)
      expect(result).toEqual(
        expect.stringContaining(
          'After 30 September 2026, any changes to Q2 figures must be made in the Q3 2026 submission.'
        )
      )
    })

    test('summary reads the figures and draft queries from the data', async () => {
      const { result } = await get()
      const summary = result
        .split('data-testid="review-summary"')[1]
        .split('</dl>')[0]

      expect(summary).toEqual(expect.stringContaining('623.073 tonnes'))
      expect(summary).toEqual(expect.stringContaining('5 of 5'))
      expect(summary).toEqual(
        expect.stringContaining(
          '2 draft queries — GreenLeaf Ltd, Voltguard Ltd (not sent yet)'
        )
      )
      expect(summary).toEqual(
        expect.stringContaining('michael.osei@ironwave.co.uk')
      )
    })

    test('links to the producer figures, compare returns and indicative obligation tabs by fragment', async () => {
      const { result } = await get()
      const base = pathTo(
        paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
        { schemeId: 'ironwave-compliance' }
      )
      const href = (key) =>
        result.match(
          new RegExp(`href="([^"]*)" data-testid="review-link-${key}"`)
        )[1]

      expect(href('figures')).toBe(`${base}#producer-figures`)
      expect(href('compare')).toBe(`${base}#compare-returns`)
      expect(href('obligation')).toBe(`${base}#indicative-obligation`)
      expect(result).toEqual(
        expect.stringContaining('Compare figures — 3-year view')
      )
    })

    test('the decision is govukRadios with nothing pre-selected, a reason and a respond-by date and time', async () => {
      const { result } = await get()

      for (const id of ['accept', 'query', 'reject']) {
        const radio = result.match(
          new RegExp(`<input[^>]*data-testid="review-decision-${id}"[^>]*>`)
        )[0]
        expect(radio).not.toEqual(expect.stringContaining('checked'))
      }
      expect(result).toEqual(
        expect.stringContaining(
          'Sends the 2 draft queries from the producer figures screen'
        )
      )
      expect(result).toEqual(
        expect.stringContaining('Reason (only needed to query or reject)')
      )
      expect(result).toEqual(
        expect.stringContaining(
          'IronWave Compliance sees this in the service when they sign in.'
        )
      )
      expect(result).toEqual(expect.stringContaining('name="respondBy-day"'))
      expect(result).toEqual(
        expect.stringContaining('data-testid="review-respond-by-time"')
      )
      expect(result).toEqual(expect.stringContaining('Confirm decision'))
    })
  })

  describe('validation', () => {
    test('nothing selected → error summary and inline error, nothing saved', async () => {
      const { result, statusCode } = await post({})

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('data-testid="review-error-summary"')
      )
      expect(result).toEqual(expect.stringContaining('href="#decision"'))
      expect(result).toEqual(
        expect.stringContaining('Select what you want to do with the return')
      )
      expect(currentStatus()).toBe('received')
    })

    test('a reason and a respond-by are required to query or reject, but not to accept', async () => {
      for (const decision of ['query', 'reject']) {
        const { result } = await post({ decision })
        expect(result).toEqual(expect.stringContaining('href="#reason"'))
        expect(result).toEqual(expect.stringContaining('href="#respondBy-day"'))
        expect(result).toEqual(expect.stringContaining('Enter a reason'))
        expect(result).toEqual(
          expect.stringContaining(
            'Enter a date and time to respond or resubmit by'
          )
        )
      }
      expect(currentStatus()).toBe('received')

      const accept = await post({ decision: 'accept' })
      expect(accept.statusCode).toBe(statusCodes.found)
    })

    test('a bad date or time is reported and the typed values are kept', async () => {
      const { result } = await post({
        decision: 'query',
        reason: 'Please explain',
        ...respondBy,
        'respondBy-day': '31',
        'respondBy-month': '2'
      })
      expect(result).toEqual(expect.stringContaining('Enter a real date'))
      expect(result).toEqual(expect.stringContaining('Please explain'))

      const time = await post({
        decision: 'query',
        reason: 'Please explain',
        ...respondBy,
        respondByTime: 'soon'
      })
      expect(time.result).toEqual(expect.stringContaining('Enter a time'))
    })

    test('querying with no draft queries left is an error', async () => {
      for (const draft of [...getDraftQueries()]) {
        removeDraftQuery(draft.id)
      }
      const { result } = await post({
        decision: 'query',
        reason: 'x',
        ...respondBy
      })
      expect(result).toEqual(
        expect.stringContaining('There are no draft queries to send')
      )
      expect(currentStatus()).toBe('received')
    })

    test('a reason over 1000 characters is rejected', async () => {
      const { result } = await post({
        decision: 'query',
        reason: 'a'.repeat(1001),
        ...respondBy
      })
      expect(result).toEqual(
        expect.stringContaining('Reason must be 1000 characters or fewer')
      )
    })
  })

  describe('accepted state', () => {
    test('accepting records the decision and the page shows the banner, H1, tag and obligation', async () => {
      const { statusCode, headers } = await post({ decision: 'accept' })
      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(url)
      expect(currentStatus()).toBe('accepted')

      const { result } = await get()
      expect(result).toEqual(
        expect.stringContaining('data-testid="review-banner"')
      )
      expect(result).toEqual(expect.stringContaining('Return accepted'))
      expect(result.indexOf('Return accepted')).toBeLessThan(
        result.indexOf('>IronWave Compliance — Q2 2026 return')
      )
      expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Accepted\s*</)
      expect(result).toMatch(/govuk-tag--green/)
      const summary = result
        .split('data-testid="review-summary"')[1]
        .split('</dl>')[0]
      expect(summary).toEqual(
        expect.stringContaining('4,290 tonnes — updated with Q2 2026')
      )
      expect(summary).toEqual(expect.stringContaining('1,850 tonnes'))
      expect(summary).toEqual(
        expect.stringContaining('2,440 tonnes (57% of the obligation)')
      )
      expect(result).not.toEqual(
        expect.stringContaining('data-testid="review-decision-form"')
      )
    })

    test('the scheme home and the dashboard show the accepted decision', async () => {
      await post({ decision: 'accept' })
      const home = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
          schemeId: 'ironwave-compliance'
        })
      })
      expect(home.result).toMatch(
        /data-testid="heading-tag"[^>]*>\s*Accepted\s*</
      )

      const dashboard = await server.inject({
        method: 'GET',
        url: paths.prototypeRegulatorPomSubmissionDashboard
      })
      expect(dashboard.result).toEqual(expect.stringContaining('Accepted (3)'))
    })
  })

  describe('queried state', () => {
    const query = () =>
      post({ decision: 'query', reason: 'Please check', ...respondBy })

    test('sending queries turns the drafts into sent queried records', async () => {
      const { statusCode } = await query()

      expect(statusCode).toBe(statusCodes.found)
      expect(currentStatus()).toBe('queried')
      expect(getDraftQueries()).toHaveLength(0)
      const sent = getQueriedRecords().filter(
        (record) => record.schemeId === 'ironwave-compliance'
      )
      expect(sent.map((record) => record.member)).toEqual([
        'GreenLeaf Ltd',
        'Voltguard Ltd'
      ])
      expect(sent[0]).toMatchObject({
        status: 'awaiting',
        originalTonnes: 212.4,
        chemistry: 'Other'
      })
    })

    test('the page shows the banner, Queried tag, decision, respond-by and the query table', async () => {
      await query()
      const { result } = await get()

      expect(result).toEqual(
        expect.stringContaining('Queries sent to IronWave Compliance')
      )
      expect(result.indexOf('Queries sent to IronWave')).toBeLessThan(
        result.indexOf('>IronWave Compliance — Q2 2026 return')
      )
      expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Queried\s*</)
      expect(result).toEqual(
        expect.stringContaining(
          '2 producer records queried. The rest of the Q2 2026 return is not changed while the scheme responds, and Q3 2026 is not blocked.'
        )
      )
      const summary = result
        .split('data-testid="review-summary"')[1]
        .split('</dl>')[0]
      expect(summary).toEqual(
        expect.stringContaining('Queried — 2 producer records')
      )
      expect(summary).toEqual(expect.stringContaining('12pm, 21 August 2026'))
      expect(summary).toEqual(expect.stringContaining('A. Nwosu'))
      const table = result
        .split('data-testid="review-queries"')[1]
        .split('</table>')[0]
      expect(table).toEqual(expect.stringContaining('GreenLeaf Ltd'))
      expect(table).toEqual(
        expect.stringContaining('Other is up 191.160 t (+900%) on Q1 2026.')
      )
      expect(table.match(/govuk-tag--orange">\s*Sent\s*</g)).toHaveLength(2)
      expect(result).toEqual(
        expect.stringContaining('What IronWave Compliance sees')
      )
    })

    test('the scheme-side query response sees the return as queried', async () => {
      await query()
      const scheme = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeComplianceSchemeQueryResponseReturnQueried, {
          year: '2026',
          quarter: 'Q2'
        })
      })
      expect(scheme.statusCode).toBe(statusCodes.ok)
      expect(scheme.result).toContain('GreenLeaf Ltd')
    })

    test('members and the Copper & Co style counts reflect the queries', async () => {
      await query()
      const members = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
          schemeId: 'ironwave-compliance'
        })
      })
      expect(
        members.result.match(/govuk-tag--orange">\s*Queried\s*</g)
      ).toHaveLength(2)
    })
  })

  describe('rejecting', () => {
    test('rejecting on this screen hands the reason and date on to the confirmation screen', async () => {
      const { statusCode, headers } = await post({
        decision: 'reject',
        reason: 'Figures entered in kilograms',
        ...respondBy
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(
        pathTo(
          paths.prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm,
          params
        )
      )
      expect(currentStatus()).toBe('received')
    })
  })

  describe('other returns and edge cases', () => {
    test('a seeded accepted return with no deadline shows the on-time wording and no late tag', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          ...params,
          quarter: 'Q1'
        })
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining(
          'Submitted 28 April 2026. Accepted on 6 May 2026.'
        )
      )
      expect(result).not.toEqual(expect.stringContaining('Submitted late'))
      expect(result).not.toEqual(
        expect.stringContaining('data-testid="review-lock-note"')
      )
    })

    test('a seeded rejected return without a recorded reason still renders', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          ...params,
          year: '2025'
        })
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Rejected\s*</)
      expect(result).toEqual(expect.stringContaining('Rejected — whole return'))
    })

    test('a return submitted before the deadline says so', async () => {
      const [submission] = getSubmissions().filter(
        (s) =>
          s.schemeId === 'ironwave-compliance' &&
          s.compliancePeriodYear === '2026' &&
          s.quarter === 'Q2'
      )
      updateSubmission(submission.id, { submittedOn: '2026-07-30T10:00:00Z' })

      const { result } = await get()
      expect(result).toEqual(
        expect.stringContaining(
          'Submitted on 30 July 2026, before the 31 July deadline.'
        )
      )
      expect(result).not.toEqual(expect.stringContaining('Submitted late'))
    })

    test('once the scheme corrects a queried record the table shows Resubmitted and the new figure', async () => {
      await post({ decision: 'query', reason: 'Please check', ...respondBy })
      const figure = getMemberFigures().find(
        (entry) => entry.member === 'GreenLeaf Ltd'
      )
      figure.status = 'resubmitted'
      figure.amendedTonnes = 1.24

      const { result } = await get()
      const table = result
        .split('data-testid="review-queries"')[1]
        .split('</table>')[0]
      expect(table).toMatch(/govuk-tag--blue">\s*Resubmitted\s*</)
      expect(table).toEqual(expect.stringContaining('1.24'))
      expect(table).toMatch(/govuk-tag--orange">\s*Sent\s*</)
    })

    test('posting a decision for an unbuilt scheme or an unknown return is a 404', async () => {
      const unbuilt = await server.inject({
        method: 'POST',
        url: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          ...params,
          schemeId: 'repic'
        }),
        payload: { decision: 'accept' }
      })
      expect(unbuilt.statusCode).toBe(statusCodes.notFound)

      const unknown = await server.inject({
        method: 'POST',
        url: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          ...params,
          year: '2019'
        }),
        payload: { decision: 'accept' }
      })
      expect(unknown.statusCode).toBe(statusCodes.notFound)
    })
  })

  test('unknown returns and unbuilt schemes are 404s', async () => {
    const missing = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
        ...params,
        year: '2019'
      })
    })
    expect(missing.statusCode).toBe(statusCodes.notFound)

    const unbuilt = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
        ...params,
        schemeId: 'repic'
      })
    })
    expect(unbuilt.statusCode).toBe(statusCodes.notFound)
  })
})
