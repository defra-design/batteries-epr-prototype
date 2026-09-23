import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionSchemeMembers', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders IronWave Compliance members from seeded data with correct status tags', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
      schemeId: 'ironwave-compliance'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Members'))
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId: 'ironwave-compliance' })}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-members-table"')
    )
    expect(result).toEqual(expect.stringContaining('Solaris Power Ltd'))
    expect(result).toEqual(expect.stringContaining('BPRN-004821'))
    expect(result).toEqual(expect.stringContaining('GreenLeaf Ltd'))
    expect(result).toEqual(expect.stringContaining('Voltguard Ltd'))
    expect(result).toEqual(expect.stringContaining('Copper &amp; Co Ltd'))
    expect(result).toEqual(expect.stringContaining('BrightCell Ltd'))
    expect(result).toEqual(expect.stringContaining('5 members registered'))

    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*Queried\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue">\s*Submitted\s*<\/strong>/)
    )

    const recordHref = pathTo(
      paths.prototypeRegulatorPomSubmissionSchemeRecord,
      {
        schemeId: 'ironwave-compliance'
      }
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${recordHref}" data-testid="scheme-members-record-link"`
      )
    )
  })

  test('404s for REPIC, which has no scheme members in this batch', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
      schemeId: 'repic'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
