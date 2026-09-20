import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionDataCheckReport', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the automated findings from seeded data with correct type tags', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
      schemeId: 'ironwave-compliance'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Data check report'))
    expect(result).toEqual(
      expect.stringContaining(
        '3 issues found in IronWaveCompliance_Q2_2026.csv'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="data-check-report-findings-table"')
    )
    expect(result).toEqual(expect.stringContaining('GreenLeaf Ltd'))
    expect(result).toEqual(
      expect.stringContaining(
        'Lithium-ion figure is 10x higher than same quarter last year'
      )
    )
    expect(result).toEqual(expect.stringContaining('Voltguard Ltd'))
    expect(result).toEqual(expect.stringContaining('Copper &amp; Co'))
    expect(result).toEqual(
      expect.stringContaining('Category code missing on row 14')
    )

    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*Swing\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--red">\s*Validation\s*<\/strong>/)
    )

    expect(result).toEqual(
      expect.stringContaining('data-testid="data-check-report-observations"')
    )

    const continueHref = pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId: 'ironwave-compliance' }
    )
    const continueTag = result.match(
      /<a[^>]*data-testid="data-check-report-continue"[^>]*>/
    )[0]
    expect(continueTag).toEqual(
      expect.stringContaining(`href="${continueHref}"`)
    )
  })

  test('404s for REPIC, which has no data check report in this batch', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
      schemeId: 'repic'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
