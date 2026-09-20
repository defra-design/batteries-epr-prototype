import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionSchemeHome', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders IronWave Compliance home with its received submission, live quick links and a Run data checks button', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
      schemeId: 'ironwave-compliance'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Batteries: Regulator'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-home-name"')
    )
    expect(result).toEqual(expect.stringContaining('IronWave Compliance'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue"[^>]*>\s*Received\s*<\/strong>/)
    )
    expect(result).toEqual(expect.stringContaining('NPWD378112'))
    expect(result).toEqual(expect.stringContaining('NPWD-APR-2026-0142'))
    expect(result).toEqual(expect.stringContaining('Priya Shah'))
    expect(result).toEqual(expect.stringContaining('Michael Osei'))
    expect(result).toEqual(expect.stringContaining('A. Nwosu'))

    const recordHref = pathTo(
      paths.prototypeRegulatorPomSubmissionSchemeRecord,
      {
        schemeId: 'ironwave-compliance'
      }
    )
    const membersHref = pathTo(
      paths.prototypeRegulatorPomSubmissionSchemeMembers,
      { schemeId: 'ironwave-compliance' }
    )
    const submissionsHref = pathTo(
      paths.prototypeRegulatorPomSubmissionSchemeSubmissions,
      { schemeId: 'ironwave-compliance' }
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${recordHref}" data-testid="scheme-home-quick-link-record"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${membersHref}" data-testid="scheme-home-quick-link-members"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${submissionsHref}" data-testid="scheme-home-quick-link-submissions"`
      )
    )

    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance&#39;s Q2 2026 return has been received. It arrived as 4 CSV files'
      )
    )
    const runDataChecksHref = pathTo(
      paths.prototypeRegulatorPomSubmissionRunningDataChecks,
      { schemeId: 'ironwave-compliance' }
    )
    const runDataChecksTag = result.match(
      /<a[^>]*data-testid="scheme-home-run-data-checks"[^>]*>/
    )[0]
    expect(runDataChecksTag).toEqual(
      expect.stringContaining(`href="${runDataChecksHref}"`)
    )
    expect(result).toEqual(expect.stringContaining('Run data checks'))

    const viewFilesTag = result.match(
      /<a[^>]*data-testid="scheme-home-view-files"[^>]*>/
    )[0]
    expect(viewFilesTag).toEqual(expect.stringContaining('href="#"'))
  })

  test('renders REPIC home with its own accepted submission, distinct people from IronWave, and dead quick links', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
      schemeId: 'repic'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('REPIC'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green"[^>]*>\s*Accepted\s*<\/strong>/)
    )
    expect(result).toEqual(expect.stringContaining('NPWD378119'))
    expect(result).toEqual(expect.stringContaining('NPWD-APR-2026-0148'))

    // REPIC must not inherit IronWave's people or reference number — the
    // Figma design copy-pasted these; the seed data corrects it.
    expect(result).not.toEqual(expect.stringContaining('NPWD378112'))
    expect(result).not.toEqual(expect.stringContaining('Priya Shah'))
    expect(result).not.toEqual(expect.stringContaining('Michael Osei'))
    expect(result).toEqual(expect.stringContaining('Elaine Morrow'))
    expect(result).toEqual(expect.stringContaining('David Chukwu'))

    const recordTag = result.match(
      /<a[^>]*data-testid="scheme-home-quick-link-record"[^>]*>/
    )[0]
    expect(recordTag).toEqual(expect.stringContaining('href="#"'))

    expect(result).not.toEqual(
      expect.stringContaining('data-testid="scheme-home-run-data-checks"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'REPIC&#39;s Q2 2026 return was accepted on 12 August 2026'
      )
    )
  })

  test('404s for a scheme without a built home', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
      schemeId: 'voltguard-batteries'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
