import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { getSubmissionNote, resetStore } from '../store.js'

const url = pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
  schemeId: 'ironwave-compliance'
})

describe('#prototypeRegulatorPomSubmissionDataCheckReport', () => {
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

  test('renders the H1, back link and a generated intro from the flags', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Figures flagged for review</h1>')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '5 figures flagged across 4 producers in IronWave Compliance’s Q2 2026 return.'
      )
    )
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPomSubmissionDashboard}"`
      )
    )
  })

  test('lists the five seeded flags with Design System tags, none of them red', async () => {
    const { result } = await get()
    const table = result
      .split('data-testid="data-check-report-findings-table"')[1]
      .split('</table>')[0]

    expect(table.split('govuk-table__row').length - 1).toBe(6)
    for (const producer of [
      'GreenLeaf Ltd',
      'Voltguard Ltd',
      'BrightCell Ltd',
      'Solaris Power Ltd'
    ]) {
      expect(table).toEqual(expect.stringContaining(producer))
    }
    expect(table).toEqual(
      expect.stringContaining(
        'Other: 212.400 t, up 191.160 t (+900%) on Q1 2026'
      )
    )
    expect(table.match(/govuk-tag--orange">\s*Variance\s*</g)).toHaveLength(2)
    expect(table).toMatch(/govuk-tag--orange">\s*Chemistry change\s*</)
    expect(table).toMatch(/govuk-tag--yellow">\s*Repeated figure\s*</)
    expect(table).toMatch(/govuk-tag--purple">\s*Estimated\s*</)
    expect(table).not.toEqual(expect.stringContaining('govuk-tag--red'))
  })

  test('shows the saved private note in a character count', async () => {
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining('data-testid="data-check-report-notes"')
    )
    expect(result).toEqual(expect.stringContaining('govuk-character-count'))
    expect(result).toEqual(
      expect.stringContaining(
        'Evidence doc explains GreenLeaf (new e-bike range).'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Private to the regulator. Notes are not sent to the scheme'
      )
    )
  })

  test('saving stores the note and continues to the producer figures', async () => {
    const { statusCode, headers } = await post({
      notes: 'Asked IronWave for the BrightCell estimate basis.'
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission, {
        schemeId: 'ironwave-compliance'
      })
    )
    expect(getSubmissionNote('ironwave-compliance', '2026', 'Q2')).toBe(
      'Asked IronWave for the BrightCell estimate basis.'
    )
    expect((await get()).result).toEqual(
      expect.stringContaining(
        'Asked IronWave for the BrightCell estimate basis.'
      )
    )
  })

  test('posting no notes at all saves an empty note and continues', async () => {
    const { statusCode } = await post({})
    expect(statusCode).toBe(statusCodes.found)
    expect(getSubmissionNote('ironwave-compliance', '2026', 'Q2')).toBe('')
  })

  test('a note over 1000 characters shows an error summary and inline error and saves nothing', async () => {
    const { result, statusCode } = await post({ notes: 'a'.repeat(1001) })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="data-check-report-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('href="#notes"'))
    expect(result).toEqual(
      expect.stringContaining('Notes must be 1000 characters or fewer')
    )
    expect(getSubmissionNote('ironwave-compliance', '2026', 'Q2')).toEqual(
      expect.stringContaining('Evidence doc explains GreenLeaf')
    )
  })

  test('404s for a scheme without built detail screens', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
        schemeId: 'repic'
      })
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
