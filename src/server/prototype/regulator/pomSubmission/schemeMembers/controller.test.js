import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { getMemberFigures, getQueriedRecords, resetStore } from '../store.js'

const url = pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
  schemeId: 'ironwave-compliance'
})

describe('#prototypeRegulatorPomSubmissionSchemeMembers', () => {
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

  const get = (path = url) => server.inject({ method: 'GET', url: path })

  test('renders the Scheme members H1, back link, scheme reference and summary', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('>Scheme members</h1>'))
    expect(result).toEqual(
      expect.stringContaining('IronWave Compliance — NPWD378112')
    )
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPomSubmissionDashboard}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        '5 producers are registered through this scheme for 2026.'
      )
    )
  })

  test('lists the seeded members with BPRN, joined date and an Included tag', async () => {
    const { result } = await get()
    const table = result
      .split('data-testid="scheme-members-table"')[1]
      .split('</table>')[0]

    for (const name of [
      'GreenLeaf Ltd',
      'Voltguard Ltd',
      'Copper &amp; Co Ltd',
      'BrightCell Ltd',
      'Solaris Power Ltd'
    ]) {
      expect(table).toEqual(expect.stringContaining(name))
    }
    expect(table).toEqual(expect.stringContaining('BPRN-004821'))
    expect(table).toEqual(expect.stringContaining('14 March 2023'))
    expect(table).toEqual(expect.stringContaining('Q2 2026 return'))
    expect(table.match(/govuk-tag--green">\s*Included\s*</g)).toHaveLength(5)
  })

  test('a member shows Queried once the regulator has queried them', async () => {
    getQueriedRecords().push({
      id: 'test-query',
      schemeId: 'ironwave-compliance',
      compliancePeriodYear: '2026',
      quarter: 'Q2',
      member: 'GreenLeaf Ltd',
      status: 'awaiting'
    })
    const { result } = await get()
    const table = result
      .split('data-testid="scheme-members-table"')[1]
      .split('</table>')[0]

    expect(table.match(/govuk-tag--orange">\s*Queried\s*</g)).toHaveLength(1)
    expect(table.match(/govuk-tag--green">\s*Included\s*</g)).toHaveLength(4)
  })

  test('a member with no figures in the return shows No figures', async () => {
    getMemberFigures().length = 0
    const { result } = await get()
    const table = result
      .split('data-testid="scheme-members-table"')[1]
      .split('</table>')[0]

    expect(table.match(/govuk-tag--grey">\s*No figures\s*</g)).toHaveLength(5)
  })

  test('links to all submissions and back to the scheme, and the download link is dead', async () => {
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSchemeSubmissions, { schemeId: 'ironwave-compliance' })}" data-testid="scheme-members-submissions-link"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Back to IronWave Compliance')
    )
    expect(result).toEqual(
      expect.stringContaining('Download member list (CSV)')
    )
  })

  test('404s for a scheme without built member screens', async () => {
    const { statusCode } = await get(
      pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
        schemeId: 'repic'
      })
    )
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
