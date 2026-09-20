import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionBatterySalesDataSubmission', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders member figures from seeded data, with queried rows offering Edit query and OK rows offering Query/Reject', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId: 'ironwave-compliance' }
    )
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Battery sales data submission — Q2 2026')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-table"'
      )
    )
    expect(result).toEqual(expect.stringContaining('GreenLeaf Ltd'))
    expect(result).toEqual(expect.stringContaining('Lithium-ion'))
    expect(result).toEqual(expect.stringContaining('12.4'))
    expect(result).toEqual(
      expect.stringContaining('Figure looks around 10x higher')
    )

    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*Queried\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--grey">\s*OK\s*<\/strong>/)
    )

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-edit-query-greenleaf-ltd"'
      )
    )
    expect(result).toEqual(expect.stringContaining('Edit query'))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-query-copper-and-co"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-reject-copper-and-co"'
      )
    )

    const continueHref = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturn,
      { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
    )
    const continueTag = result.match(
      /<a[^>]*data-testid="battery-sales-data-submission-continue"[^>]*>/
    )[0]
    expect(continueTag).toEqual(
      expect.stringContaining(`href="${continueHref}"`)
    )
  })

  test('renders a real govukTabs strip with Member figures selected by default, each panel deep-linkable by fragment', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId: 'ironwave-compliance' }
    )
    const { result } = await server.inject({ method: 'GET', url })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-tabs"'
      )
    )

    const memberFiguresTabItem = result.match(
      /<li class="govuk-tabs__list-item[^"]*"[^>]*>\s*<a[^>]*href="#member-figures"[^>]*data-testid="battery-sales-data-submission-tab-member-figures"/
    )[0]
    expect(memberFiguresTabItem).toEqual(
      expect.stringContaining('govuk-tabs__list-item--selected')
    )
    expect(result).toEqual(expect.stringContaining('Member figures'))

    const compareReturnsTag = result.match(
      /<a[^>]*data-testid="battery-sales-data-submission-tab-compare-returns"[^>]*>/
    )[0]
    expect(compareReturnsTag).toEqual(
      expect.stringContaining('href="#compare-returns"')
    )
    expect(result).toEqual(expect.stringContaining('Compare returns'))

    const indicativeObligationTag = result.match(
      /<a[^>]*data-testid="battery-sales-data-submission-tab-indicative-obligation"[^>]*>/
    )[0]
    expect(indicativeObligationTag).toEqual(
      expect.stringContaining('href="#indicative-obligation"')
    )
    expect(result).toEqual(expect.stringContaining('Indicative obligation'))
  })

  test('renders the Compare returns panel content from seeded data, with tags coloured by swing threshold', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId: 'ironwave-compliance' }
    )
    const { result } = await server.inject({ method: 'GET', url })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-compare-returns-table"'
      )
    )
    expect(result).toEqual(expect.stringContaining('General use'))
    expect(result).toEqual(expect.stringContaining('125,000'))
    expect(result).toEqual(expect.stringContaining('204,070'))
    expect(result).toEqual(expect.stringContaining('Light means of transport'))
    expect(result).toEqual(expect.stringContaining('Coin &amp; button cells'))
    expect(result).toEqual(expect.stringContaining('623,073'))

    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*39% ↑\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*54% ↑\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--grey">\s*16%\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--grey">\s*15%\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--grey">\s*3%\s*<\/strong>/)
    )

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-view-reason-general-use"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-alert-level"'
      )
    )
    expect(result).toEqual(expect.stringContaining('value="20"'))
  })

  test('renders the Indicative obligation panel content from seeded data, with a verified tag', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId: 'ironwave-compliance' }
    )
    const { result } = await server.inject({ method: 'GET', url })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="battery-sales-data-submission-indicative-obligation-summary"'
      )
    )
    expect(result).toEqual(expect.stringContaining('9,800 tonnes'))
    expect(result).toEqual(expect.stringContaining('9,500 tonnes'))
    expect(result).toEqual(
      expect.stringContaining('9,100 tonnes (annualised: 9,300 tonnes)')
    )
    expect(result).toEqual(expect.stringContaining('9,533 tonnes'))
    expect(result).toEqual(expect.stringContaining('45%'))
    expect(result).toEqual(
      expect.stringContaining('Indicative obligation (2027)')
    )
    expect(result).toEqual(expect.stringContaining('4,290 tonnes'))

    expect(result).toEqual(
      expect.stringMatching(
        /govuk-tag--green"[^>]*>\s*Calculation verified\s*<\/strong>/
      )
    )
  })

  test('404s for REPIC, which has no battery sales data submission screen in this batch', async () => {
    const url = pathTo(
      paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
      { schemeId: 'repic' }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
