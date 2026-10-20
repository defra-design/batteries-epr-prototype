import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionDashboard', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const get = (query = '') =>
    server.inject({
      method: 'GET',
      url: `${paths.prototypeRegulatorPomSubmissionDashboard}${query}`
    })

  test('renders the H1, breadcrumb and the shared regulator navigation including Reports', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('>PoM submissions</h1>'))
    expect(result).toEqual(expect.stringContaining('pEPR: Regulator'))
    expect(result).toEqual(expect.stringContaining('>NPWD</a>'))
    for (const item of [
      'Registrations',
      'PoM submissions',
      'Compliance schemes',
      'Reports',
      'Manage account'
    ]) {
      expect(result).toEqual(expect.stringContaining(`>${item}</a>`))
    }
    expect(result).not.toEqual(expect.stringContaining('My profile'))
    expect(result).toEqual(
      expect.stringMatching(
        /app-regulator-nav__item--current[^>]*>\s*<a[^>]*data-testid="regulator-nav-pomSubmissions"/
      )
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.devReset}"`))
  })

  test('shows the quick links, the year select and the four task cards from the data', async () => {
    const { result } = await get()

    for (const text of [
      'Overdue submissions',
      'Open queries',
      'Failed validation uploads',
      'Other reports'
    ]) {
      expect(result).toEqual(expect.stringContaining(text))
    }
    expect(result).toEqual(
      expect.stringContaining('data-testid="pom-dashboard-year"')
    )
    expect(result).toEqual(expect.stringContaining('Q2 2026 tasks'))
    const card = (key) =>
      result
        .split(`data-testid="pom-dashboard-card-${key}"`)[1]
        .split('</div>')[0]
    expect(card('toReview')).toEqual(
      expect.stringContaining('Review IronWave Compliance return')
    )
    expect(card('toReview')).toMatch(/>\s*1\s*</)
    expect(card('newResponses')).toMatch(/>\s*1\s*</)
    expect(card('openQueries')).toMatch(/>\s*1\s*</)
  })

  test('lists every scheme in the All tab with Design System status tags', async () => {
    const { result } = await get()
    const table = result
      .split('data-testid="pom-dashboard-table-all"')[1]
      .split('</table>')[0]

    for (const name of [
      'IronWave Compliance',
      'REPIC',
      'Copper &amp; Co Compliance',
      'BrightCell Compliance',
      'Voltguard Batteries'
    ]) {
      expect(table).toEqual(expect.stringContaining(name))
    }
    expect(table).toMatch(/govuk-tag--blue">\s*Received\s*</)
    expect(table).toMatch(/govuk-tag--orange">\s*Queried\s*</)
    expect(table.match(/govuk-tag--green">\s*Accepted\s*</g)).toHaveLength(2)
    expect(result).toEqual(expect.stringContaining('All (5)'))
    expect(result).toEqual(expect.stringContaining('Received (1)'))
    expect(result).toEqual(expect.stringContaining('Accepted (2)'))
    expect(result).toEqual(expect.stringContaining('Queried (2)'))
  })

  test('shows the seeded member counts, submitted dates and flags', async () => {
    const { result } = await get()
    const table = result
      .split('data-testid="pom-dashboard-table-all"')[1]
      .split('</table>')[0]
    expect(table).toEqual(expect.stringContaining('8 August 2026'))
    expect(table).toEqual(expect.stringContaining('1 August 2026'))
    expect(table).toEqual(expect.stringContaining('31 July 2026'))
    expect(table).toMatch(/>\s*24\s*</)
  })

  test('only IronWave and REPIC have a built scheme home to link to; the others are dead', async () => {
    const { result } = await get()
    const href = (id) =>
      result.match(
        new RegExp(
          `href="([^"]*)"[^>]*data-testid="pom-dashboard-scheme-${id}"`
        )
      )[1]

    expect(href('ironwave-compliance')).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
        schemeId: 'ironwave-compliance'
      })
    )
    expect(href('voltguard-batteries')).toBe('#')
  })

  test('sorts by status when asked, marking the column with aria-sort', async () => {
    const { result } = await get('?sort=status&order=asc')
    const table = result
      .split('data-testid="pom-dashboard-table-all"')[1]
      .split('</table>')[0]

    expect(table).toEqual(expect.stringContaining('aria-sort="ascending"'))
    expect(table.indexOf('REPIC')).toBeLessThan(table.indexOf('IronWave'))
  })

  test('a year with no returns shows an empty state instead of a table', async () => {
    const { result } = await get('?year=2024')
    expect(result).toEqual(
      expect.stringContaining('There are no returns for Q2 2024.')
    )
  })
})
