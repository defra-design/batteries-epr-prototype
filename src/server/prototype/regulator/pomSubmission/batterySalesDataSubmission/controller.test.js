import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { getDraftQueries, resetStore } from '../store.js'

const url = pathTo(
  paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
  { schemeId: 'ironwave-compliance' }
)

describe('#prototypeRegulatorPomSubmissionBatterySalesDataSubmission', () => {
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

  const get = (query = '') =>
    server.inject({ method: 'GET', url: `${url}${query}` })

  test('H1 is the return heading, with a back link and three govukTabs deep-linkable by fragment', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>IronWave Compliance — Q2 2026 return</h1>')
    )
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPomSubmissionDashboard}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="battery-sales-tabs"')
    )
    for (const id of [
      'producer-figures',
      'compare-returns',
      'indicative-obligation'
    ]) {
      expect(result).toEqual(expect.stringContaining(`href="#${id}"`))
      expect(result).toEqual(expect.stringContaining(`id="${id}"`))
    }
  })

  test('producer figures: the five seeded producers with change tags coloured by meaning and the draft queries', async () => {
    const { result } = await get()
    const table = result
      .split('data-testid="producer-figures-table"')[1]
      .split('</table>')[0]

    for (const name of [
      'GreenLeaf Ltd',
      'Voltguard Ltd',
      'Copper &amp; Co',
      'BrightCell Ltd',
      'Solaris Power'
    ]) {
      expect(table).toEqual(expect.stringContaining(name))
    }
    expect(table).toEqual(expect.stringContaining('212.400'))
    expect(table).toMatch(/govuk-tag--orange">\s*\+191\.160 t\s*</)
    expect(table).toMatch(/govuk-tag--orange">\s*Chemistry\s*</)
    // Over the tonnage alert level, so flagged — Figma had it grey.
    expect(table).toMatch(/govuk-tag--orange">\s*\+7\.823 t\s*</)
    expect(table).toMatch(/govuk-tag--grey">\s*−2\.100 t\s*</)
    expect(table).toMatch(/govuk-tag--grey">\s*None\s*</)
    expect(table).toEqual(
      expect.stringContaining(
        'Other is up 191.160 t (+900%) on Q1 2026. Please explain the increase or correct the figure.'
      )
    )
    expect(table.match(/>Raise query/g)).toHaveLength(3)
    expect(table.match(/>Edit/g)).toHaveLength(2)
  })

  test('the filters count all, flagged and draft producers and narrow the table', async () => {
    const { result } = await get()
    expect(result).toEqual(expect.stringContaining('All (5)'))
    expect(result).toEqual(expect.stringContaining('Draft queries (2)'))
    expect(result).toEqual(expect.stringContaining('Flagged (3)'))

    const drafts = await get('?show=drafts')
    const table = drafts.result
      .split('data-testid="producer-figures-table"')[1]
      .split('</table>')[0]
    expect(table).toEqual(expect.stringContaining('GreenLeaf Ltd'))
    expect(table).not.toEqual(expect.stringContaining('Solaris Power'))

    const flagged = await get('?show=flagged')
    const flaggedTable = flagged.result
      .split('data-testid="producer-figures-table"')[1]
      .split('</table>')[0]
    expect(flaggedTable).toEqual(expect.stringContaining('BrightCell Ltd'))
    expect(flaggedTable).not.toEqual(expect.stringContaining('Copper'))

    const search = await get('?producer=solaris')
    expect(
      search.result
        .split('data-testid="producer-figures-table"')[1]
        .split('</table>')[0]
    ).toEqual(expect.stringContaining('Solaris Power'))

    const none = await get('?producer=zzz')
    expect(none.result).toEqual(
      expect.stringContaining('data-testid="producer-figures-empty"')
    )
  })

  test('removing a draft query posts, drops it from the table and keeps the other', async () => {
    const [first] = getDraftQueries()
    const removeUrl = pathTo(
      paths.prototypeRegulatorPomSubmissionRemoveDraftQuery,
      { schemeId: 'ironwave-compliance', queryId: first.id }
    )
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: removeUrl
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(`${url}#producer-figures`)
    expect(getDraftQueries()).toHaveLength(1)
    const { result } = await get()
    expect(result).toEqual(expect.stringContaining('Draft queries (1)'))
  })

  test('compare returns: threshold, per-producer comparison, chemistry on last quarter and totals', async () => {
    const { result } = await get()
    const table = result
      .split('data-testid="compare-returns-table"')[1]
      .split('</table>')[0]

    expect(result).toEqual(expect.stringContaining('Compare producer returns'))
    expect(result).toEqual(expect.stringContaining('20% or 5.000 t'))
    expect(table).toEqual(expect.stringContaining('GreenLeaf Ltd (Other)'))
    expect(table).toEqual(expect.stringContaining('131.100 (Other)'))
    expect(table).toEqual(expect.stringContaining('128.000 (Other)'))
    // Solaris is in the total, so it must be in the table (Figma omitted it).
    expect(table).toEqual(expect.stringContaining('Solaris Power (Lead-acid)'))
    expect(table).toEqual(expect.stringContaining('623.073'))
    expect(table).toEqual(expect.stringContaining('426.190'))
    expect(table).toEqual(expect.stringContaining('+196.883 t'))
    expect(table).toEqual(expect.stringContaining('416.300'))
  })

  test('indicative obligation reads the seeded calculation', async () => {
    const { result } = await get()
    const list = result
      .split('data-testid="indicative-obligation-list"')[1]
      .split('</dl>')[0]

    expect(list).toEqual(expect.stringContaining('9,800 tonnes'))
    expect(list).toEqual(
      expect.stringContaining('9,100 tonnes (annualised: 9,300 tonnes)')
    )
    expect(list).toEqual(
      expect.stringContaining('9,533 tonnes (2026 is a part year so far)')
    )
    expect(list).toEqual(expect.stringContaining('1,850 tonnes'))
    expect(list).toEqual(
      expect.stringContaining('Indicative obligation (2027, at 45%)')
    )
    expect(list).toEqual(expect.stringContaining('4,290 tonnes'))
    expect(list).toEqual(
      expect.stringContaining('2,440 tonnes (57% of the obligation)')
    )
  })

  test('Continue to decision goes to the review, and an unbuilt scheme is a 404', async () => {
    const { result } = await get()
    const button = result.match(
      /<a[^>]*data-testid="battery-sales-continue"[^>]*>/
    )[0]
    expect(button).toEqual(
      expect.stringContaining(
        pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
          schemeId: 'ironwave-compliance',
          year: '2026',
          quarter: 'Q2'
        })
      )
    )

    const { statusCode } = await server.inject({
      method: 'GET',
      url: pathTo(
        paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
        { schemeId: 'repic' }
      )
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
