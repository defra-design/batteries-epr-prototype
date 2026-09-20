import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { PROTOTYPE_COMPLIANCE_SCHEME_NAME } from '../../../../../config/prototype-compliance-scheme-content.js'

const testId = (id) => `data-testid="${id}"`

describe('#prototypeWasteDataAccountHome', () => {
  let server
  let result
  let statusCode

  beforeAll(async () => {
    server = await initialiseServer()
    ;({ result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataAccountHome
    }))
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the account home for the seeded scheme', () => {
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        `Account home – ${PROTOTYPE_COMPLIANCE_SCHEME_NAME}`
      )
    )
  })

  test('does not use the Figma sample organisation or people', () => {
    expect(result).not.toEqual(expect.stringContaining('Voltguard'))
    expect(result).not.toEqual(expect.stringContaining('David Kwan'))
    expect(result).not.toEqual(expect.stringContaining('Clem Referrer'))
  })

  test('renders EA and NIEA jurisdiction tabs with govukTabs', () => {
    expect(result).toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).toEqual(expect.stringContaining(testId('waste-data-tab-ea')))
    expect(result).toEqual(
      expect.stringContaining(testId('waste-data-tab-niea'))
    )
    expect(result).toEqual(
      expect.stringContaining(`${PROTOTYPE_COMPLIANCE_SCHEME_NAME} (EA)`)
    )
    expect(result).toEqual(
      expect.stringContaining(`${PROTOTYPE_COMPLIANCE_SCHEME_NAME} (NIEA)`)
    )
  })

  test('renders the EA panel headings and intro', () => {
    expect(result).toEqual(
      expect.stringContaining('Data for the Environment Agency')
    )
    expect(result).toEqual(expect.stringContaining('Collect from members'))
    expect(result).toEqual(
      expect.stringContaining('Waste data reporting periods 2026')
    )
  })

  test('the NIEA panel says there are no reporting periods rather than duplicating the EA table', () => {
    expect(result).toEqual(
      expect.stringContaining(testId('waste-data-niea-no-periods'))
    )
    expect(result.match(/waste-data-quarters-table/g)).toHaveLength(1)
  })

  test('renders the quarters in a govukTable with the seeded dates', () => {
    expect(result).toEqual(
      expect.stringContaining(testId('waste-data-quarters-table'))
    )
    for (const quarter of ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026']) {
      expect(result).toEqual(expect.stringContaining(quarter))
    }
    for (const date of [
      '1 Apr 2026',
      '30 Apr 2026',
      '1 Jul 2026',
      '31 Jul 2026',
      '1 Oct 2026',
      '31 Oct 2026',
      '1 Jan 2027',
      '31 Jan 2027'
    ]) {
      expect(result).toEqual(expect.stringContaining(date))
    }
  })

  test.each([
    [1, 'Accepted', 'govuk-tag--green'],
    [2, 'Query raised', 'govuk-tag--orange'],
    [3, 'Not started', 'govuk-tag--grey'],
    [4, 'Not yet available', 'govuk-tag--grey']
  ])(
    'Q%i shows a %s tag coloured by meaning',
    (quarter, label, colourClass) => {
      const tag = result.match(
        new RegExp(
          `<strong[^>]*data-testid="waste-data-quarter-${quarter}-status"[^>]*>`
        )
      )[0]

      expect(tag).toEqual(expect.stringContaining(colourClass))
      expect(result).toEqual(
        expect.stringMatching(
          new RegExp(
            `data-testid="waste-data-quarter-${quarter}-status"[^>]*>\\s*${label}\\s*</strong>`
          )
        )
      )
    }
  )

  test('only Q3 links on to the start of the submission', () => {
    const q3Action = result.match(
      /<a[^>]*data-testid="waste-data-quarter-3-action"[^>]*>/
    )[0]
    expect(q3Action).toEqual(
      expect.stringContaining(`href="${paths.prototypeWasteDataStart}"`)
    )
    expect(result).toEqual(expect.stringContaining('Record what you collected'))
    expect(result).toEqual(expect.stringContaining('Available 1 Jan 2027'))
  })

  test('renders the Q3 obligation card as a govukSummaryList', () => {
    expect(result).toEqual(expect.stringContaining('Your Q3 2026 obligation'))
    expect(result).toEqual(
      expect.stringContaining(testId('waste-data-obligation'))
    )
    expect(result).toEqual(expect.stringContaining('1 Jul to 30 Sep 2026'))
    expect(result).toEqual(
      expect.stringContaining('210.500 tonnes — approximately 45%')
    )
    expect(result).toEqual(
      expect.stringContaining(testId('waste-data-collected-value'))
    )
    expect(result).toEqual(expect.stringContaining('Not yet recorded'))
  })

  test('the start button and the record-collection link both go to the start page', () => {
    const button = result.match(
      /<a[^>]*data-testid="waste-data-start-button"[^>]*>/
    )[0]
    const record = result.match(
      /<a[^>]*data-testid="waste-data-record-collection"[^>]*>/
    )[0]

    expect(button).toEqual(
      expect.stringContaining(`href="${paths.prototypeWasteDataStart}"`)
    )
    expect(record).toEqual(
      expect.stringContaining(`href="${paths.prototypeWasteDataStart}"`)
    )
  })

  test('does not render an Estimated flag', () => {
    expect(result).not.toEqual(expect.stringContaining('Estimated'))
  })

  test('the back link returns to the prototype index', () => {
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(`href="${paths.prototype}"`)
    )
  })

  test('is task-flow chrome: service name, no pEPR header, no breadcrumbs, no masthead nav', () => {
    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
    expect(result).not.toEqual(expect.stringContaining('My profile'))
    expect(result).not.toEqual(expect.stringContaining('Sign out'))
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="compliance-scheme-tabs"')
    )
  })

  test('emits the page payload the client uses to show the stored Q3 state', () => {
    const payload = JSON.parse(
      result.match(/id="page-payload"[^>]*>([^<]+)<\/script>/)[1]
    )

    expect(payload).toMatchObject({
      step: 'accountHome',
      target: 'hydrate',
      quarter: 3,
      submittedUrl: paths.prototypeWasteDataSubmitted,
      submittedStatus: { label: 'Submitted', colour: 'blue' }
    })
  })
})
