import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import {
  getQueriedRecords,
  getSubmissions,
  resetStore,
  updateSubmission
} from '../store.js'

const homeUrl = (schemeId) =>
  pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId })

describe('#prototypeRegulatorPomSubmissionSchemeHome', () => {
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

  const get = (schemeId) =>
    server.inject({ method: 'GET', url: homeUrl(schemeId) })

  test('IronWave: scheme name H1 with a Received tag, back link, NPWD reference and scheme details', async () => {
    const { result, statusCode } = await get('ironwave-compliance')

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatch(/<h1[^>]*>\s*IronWave Compliance/)
    expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Received\s*</)
    expect(result).toEqual(expect.stringContaining('pEPR: Regulator'))
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPomSubmissionDashboard}"`
      )
    )
    expect(result).toEqual(expect.stringContaining('NPWD378112'))
    const details = result
      .split('data-testid="scheme-home-details"')[1]
      .split('</dl>')[0]
    expect(details).toEqual(expect.stringContaining('NPWD-APR-2026-0142'))
    expect(details).toEqual(expect.stringContaining('Priya Shah'))
    expect(details).toEqual(expect.stringContaining('Michael Osei'))
    expect(details).toEqual(expect.stringContaining('See all members'))
  })

  test('IronWave received: deadline note, task list and the Review this return button', async () => {
    const { result } = await get('ironwave-compliance')

    expect(result).toEqual(expect.stringContaining('Q2 2026 submission'))
    expect(result).toEqual(
      expect.stringContaining(
        'Due 31 July 2026 — received 8 days late. After 30 September 2026, any changes to Q2 figures must be made in the Q3 2026 submission.'
      )
    )
    const tasks = result
      .split('data-testid="scheme-home-task-list"')[1]
      .split('</ul>')[0]
    for (const title of [
      'Submitted by the scheme',
      'Automated data checks',
      'Regulator review',
      'Decision'
    ]) {
      expect(tasks).toEqual(expect.stringContaining(title))
    }
    expect(tasks).toEqual(expect.stringContaining('Cannot start yet'))

    const button = result.match(
      /<a[^>]*data-testid="scheme-home-primary-action"[^>]*>/
    )[0]
    expect(button).toEqual(
      expect.stringContaining(
        pathTo(paths.prototypeRegulatorPomSubmissionRunningDataChecks, {
          schemeId: 'ironwave-compliance',
          year: '2026',
          quarter: 'Q2'
        })
      )
    )
    expect(result).toEqual(expect.stringContaining('Review this return'))
  })

  test('IronWave received: submission summary reads the seeded figures', async () => {
    const { result } = await get('ironwave-compliance')
    const summary = result
      .split('data-testid="scheme-home-submission-summary"')[1]
      .split('</dl>')[0]

    expect(summary).toEqual(expect.stringContaining('Q2 2026 (1 Apr – 30 Jun)'))
    expect(summary).toEqual(
      expect.stringContaining(
        '4 CSV files (5 producers) + 1 supporting evidence document'
      )
    )
    expect(summary).toEqual(
      expect.stringContaining('Passed — 5 figures flagged for review')
    )
    expect(summary).toEqual(
      expect.stringContaining('2 uploads rejected — Q2 (1), Q1 (1)')
    )
    expect(summary).toEqual(expect.stringContaining('8 August 2026, 14:12'))
  })

  test('links to the record, members and all submissions, and uses one name for the history link', async () => {
    const { result } = await get('ironwave-compliance')
    const href = (key) =>
      result.match(
        new RegExp(
          `href="([^"]*)"[^>]*data-testid="scheme-home-quick-link-${key}"`
        )
      )[1]

    expect(href('record')).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionSchemeRecord, {
        schemeId: 'ironwave-compliance'
      })
    )
    expect(href('members')).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
        schemeId: 'ironwave-compliance'
      })
    )
    expect(href('submissions')).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionSchemeSubmissions, {
        schemeId: 'ironwave-compliance'
      })
    )
    expect(result).toEqual(
      expect.stringContaining('View history for this quarter')
    )
    expect(result).not.toEqual(expect.stringContaining('activity timeline'))
  })

  test('REPIC: accepted tag and its own people, with the record link live and the others dead', async () => {
    const { result, statusCode } = await get('repic')

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Accepted\s*</)
    expect(result).toEqual(expect.stringContaining('NPWD378119'))
    expect(result).toEqual(expect.stringContaining('NPWD-APR-2026-0148'))
    // The Figma design copy-pasted IronWave's references and people into REPIC.
    expect(result).not.toEqual(expect.stringContaining('NPWD378112'))
    expect(result).not.toEqual(expect.stringContaining('Priya Shah'))
    expect(result).toEqual(expect.stringContaining('Elaine Morrow'))
    expect(result).toEqual(expect.stringContaining('David Chukwu'))
    expect(result).toEqual(
      expect.stringContaining(
        'REPIC&#39;s Q2 2026 return was accepted on 12 August 2026'
      )
    )
    const href = (key) =>
      result.match(
        new RegExp(
          `href="([^"]*)"[^>]*data-testid="scheme-home-quick-link-${key}"`
        )
      )[1]
    expect(href('record')).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionSchemeRecord, {
        schemeId: 'repic'
      })
    )
    expect(href('members')).toBe('#')
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="scheme-home-primary-action"')
    )
  })

  test('Copper & Co: queried state from the queried records, with a Review answered records button', async () => {
    const { result, statusCode } = await get('copper-and-co-compliance')

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatch(/<h1[^>]*>\s*Copper &amp; Co Compliance/)
    expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Queried\s*</)
    expect(result).toEqual(
      expect.stringContaining(
        'You queried 2 records in this return on 5 August 2026.'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'The other 246 records in the quarter are unaffected'
      )
    )
    const summary = result
      .split('data-testid="scheme-home-submission-summary"')[1]
      .split('</dl>')[0]
    expect(summary).toEqual(expect.stringContaining('2 of 248'))
    expect(summary).toEqual(expect.stringContaining('9 September 2026'))
    expect(summary).toEqual(expect.stringContaining('Tom Blake'))
    expect(result).toEqual(expect.stringContaining('View queried records (2)'))
    expect(result).toEqual(expect.stringContaining('Review answered records'))
  })

  test('a return submitted on time shows the on-time deadline wording', async () => {
    const submission = getSubmissions().find(
      (s) =>
        s.schemeId === 'ironwave-compliance' &&
        s.quarter === 'Q2' &&
        s.compliancePeriodYear === '2026'
    )
    updateSubmission(submission.id, { submittedOn: '2026-07-30T10:00:00Z' })

    const { result } = await get('ironwave-compliance')
    expect(result).toEqual(
      expect.stringContaining(
        'Due 31 July 2026. After 30 September 2026, any changes to Q2 figures must be made in the Q3 2026 submission.'
      )
    )
  })

  test('a rejected return shows the rejected wording', async () => {
    const submission = getSubmissions().find(
      (s) =>
        s.schemeId === 'ironwave-compliance' &&
        s.quarter === 'Q2' &&
        s.compliancePeriodYear === '2026'
    )
    updateSubmission(submission.id, {
      status: 'rejected',
      decidedOn: '2026-08-14T10:00:00Z'
    })

    const { result } = await get('ironwave-compliance')
    expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*Rejected\s*</)
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance&#39;s Q2 2026 return was rejected on 14 August 2026'
      )
    )
  })

  test('Copper & Co has no Review answered records button until a query is answered', async () => {
    for (const record of getQueriedRecords()) {
      record.status = 'awaiting'
    }
    const { result } = await get('copper-and-co-compliance')

    expect(result).not.toEqual(
      expect.stringContaining('data-testid="scheme-home-primary-action"')
    )
  })

  test('a scheme without a built home is a 404', async () => {
    expect((await get('voltguard-batteries')).statusCode).toBe(
      statusCodes.notFound
    )
    expect((await get('brightcell-compliance')).statusCode).toBe(
      statusCodes.notFound
    )
  })
})
