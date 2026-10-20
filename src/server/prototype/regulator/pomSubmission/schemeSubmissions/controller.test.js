import { vi } from 'vitest'

import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeSubmissions, {
  schemeId: 'ironwave-compliance'
})

describe('#prototypeRegulatorPomSubmissionSchemeSubmissions', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  // The windows count down from "today", so pin it to the prototype's story.
  const getOn = (isoDate) => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(isoDate))
    return server.inject({ method: 'GET', url })
  }

  test('H1, scheme reference, back link and intro', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('>All submissions</h1>'))
    expect(result).toEqual(
      expect.stringContaining('IronWave Compliance · NPWD378112')
    )
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPomSubmissionDashboard}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Every quarter is decided on its own. A queried or rejected quarter does not block the ones after it.'
      )
    )
  })

  test('groups the seeded submissions by year, newest first, with Design System tags', async () => {
    const { result } = await server.inject({ method: 'GET', url })
    const year2026 = result
      .split('data-testid="scheme-submissions-table-2026"')[1]
      .split('</table>')[0]
    const year2025 = result
      .split('data-testid="scheme-submissions-table-2025"')[1]
      .split('</table>')[0]

    expect(year2026.indexOf('Q2 2026')).toBeLessThan(
      year2026.indexOf('Q1 2026')
    )
    expect(year2026).toMatch(/govuk-tag--blue">\s*Received\s*</)
    expect(year2026).toEqual(expect.stringContaining('Awaiting decision'))
    expect(year2026).toEqual(expect.stringContaining('6 May 2026, A. Nwosu'))
    expect(year2026).toEqual(expect.stringContaining('28 April 2026'))

    expect(year2025).toEqual(expect.stringContaining('Q4 2025'))
    expect(year2025).toEqual(
      expect.stringContaining('9 February 2026, A. Nwosu')
    )
    expect(year2025).toEqual(expect.stringContaining('Q2 2025 (resubmitted)'))
    expect(year2025).toMatch(/govuk-tag--red">\s*Rejected\s*</)
    expect(year2025.match(/govuk-tag--green">\s*Accepted\s*</g)).toHaveLength(3)
  })

  test('submission windows: Q2 open with a countdown, Q1 and Q3 locked, Q4 on an extended window', async () => {
    const { result } = await getOn('2026-08-14T12:00:00Z')
    const windows = result
      .split('data-testid="scheme-submissions-windows"')[1]
      .split('</table>')[0]

    expect(windows).toEqual(expect.stringContaining('Locks 30 September 2026'))
    expect(windows).toMatch(/govuk-tag--yellow">\s*Open · locks in 47 days\s*</)
    expect(windows).toEqual(expect.stringContaining('Locked 30 June 2026'))
    expect(windows).toEqual(expect.stringContaining('Locked 31 December 2025'))
    expect(windows.match(/govuk-tag--grey">\s*Locked\s*</g)).toHaveLength(2)
    expect(windows).toEqual(
      expect.stringContaining('Open for adjustments until 31 January 2029')
    )
    expect(windows).toMatch(/govuk-tag--blue">\s*Extended window · 3 years\s*</)
  })

  test('once the Q2 lock date has passed it shows as locked', async () => {
    const { result } = await getOn('2026-10-19T12:00:00Z')
    const windows = result
      .split('data-testid="scheme-submissions-windows"')[1]
      .split('</table>')[0]

    expect(windows).toEqual(expect.stringContaining('Locked 30 September 2026'))
    expect(windows).not.toEqual(expect.stringContaining('locks in'))
  })

  test('the Q4 extended window closes after three years', async () => {
    const { result } = await getOn('2029-02-01T12:00:00Z')
    const windows = result
      .split('data-testid="scheme-submissions-windows"')[1]
      .split('</table>')[0]
    expect(windows).not.toEqual(expect.stringContaining('Extended window'))
    expect(windows.match(/govuk-tag--grey">\s*Locked\s*</g)).toHaveLength(4)
  })

  test('links to the scheme and uses "scheme history", not "activity timeline"', async () => {
    const { result } = await server.inject({ method: 'GET', url })

    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId: 'ironwave-compliance' })}" data-testid="scheme-submissions-home-link"`
      )
    )
    expect(result).toEqual(expect.stringContaining('View scheme history'))
    expect(result).not.toEqual(expect.stringContaining('activity timeline'))
    expect(result).toEqual(
      expect.stringContaining('Download submission history (.csv)')
    )
  })

  test('404s for a scheme without a submission history screen', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionSchemeSubmissions, {
        schemeId: 'repic'
      })
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
