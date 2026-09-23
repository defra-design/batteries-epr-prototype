import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionSchemeRecord', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the IronWave Compliance scheme record from seeded data', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeRecord, {
      schemeId: 'ironwave-compliance'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Scheme record'))
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId: 'ironwave-compliance' })}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-record-organisation"')
    )
    expect(result).toEqual(expect.stringContaining('IronWave Compliance Ltd'))
    expect(result).toEqual(expect.stringContaining('09112477'))
    expect(result).toEqual(
      expect.stringContaining('2 Foundry Road, Sheffield, S9 2LP')
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue"[^>]*>\s*Received\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringContaining('Priya Shah — priya.shah@ironwave.co.uk')
    )
    expect(result).toEqual(
      expect.stringContaining('Michael Osei — michael.osei@ironwave.co.uk')
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
        `href="${membersHref}" data-testid="scheme-record-link-members"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${submissionsHref}" data-testid="scheme-record-link-submissions"`
      )
    )

    const timelineTag = result.match(
      /<a[^>]*data-testid="scheme-record-link-timeline"[^>]*>/
    )[0]
    expect(timelineTag).toEqual(expect.stringContaining('href="#"'))
  })

  test('404s for REPIC, which has no scheme record in this batch', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeRecord, {
      schemeId: 'repic'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
