import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionSchemeSubmissions', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders IronWave Compliance submission history grouped by year, from seeded data', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeSubmissions, {
      schemeId: 'ironwave-compliance'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('All submissions'))
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId: 'ironwave-compliance' })}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-submissions-table-2026"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-submissions-table-2025"')
    )
    expect(result).toEqual(expect.stringContaining('Q2 2026'))
    expect(result).toEqual(expect.stringContaining('Q1 2026'))
    expect(result).toEqual(expect.stringContaining('Q4 2025'))
    expect(result).toEqual(expect.stringContaining('Q3 2025'))
    expect(result).toEqual(expect.stringContaining('Q2 2025'))
    expect(result).toEqual(expect.stringContaining('Q2 2025 (resubmitted)'))

    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue">\s*Received\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green">\s*Accepted\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--red">\s*Rejected\s*<\/strong>/)
    )

    expect(result).toEqual(expect.stringContaining('Awaiting decision'))
    expect(result).toEqual(expect.stringContaining('6 May 2026, A. Nwosu'))

    const year2026Index = result.indexOf(
      'data-testid="scheme-submissions-table-2026"'
    )
    const year2025Index = result.indexOf(
      'data-testid="scheme-submissions-table-2025"'
    )
    expect(year2026Index).toBeGreaterThan(-1)
    expect(year2025Index).toBeGreaterThan(year2026Index)
  })

  test('404s for REPIC, which has no submission history screen in this batch', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeSubmissions, {
      schemeId: 'repic'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
