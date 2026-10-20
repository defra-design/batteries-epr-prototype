import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorRegistrations', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const getPage = async (url = paths.prototypeRegulatorRegistrations) =>
    server.inject({ method: 'GET', url })

  test('uses the regulator layout with the NPWD > Registrations breadcrumb and H1', async () => {
    const { result, statusCode } = await getPage()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('app-regulator-hero'))
    expect(result).toEqual(expect.stringContaining('>NPWD</a>'))
    expect(result).toEqual(expect.stringContaining('>Registrations</h1>'))
    expect(result).toEqual(expect.stringContaining('aria-current="page"'))
  })

  test('quick links send "Send a pre-registration link" to the form', async () => {
    const { result } = await getPage()

    expect(result).toMatch(
      new RegExp(
        `href="${paths.prototypeRegulatorPreRegistrationLink}"[^>]*data-testid="regulator-registrations-quick-links-preRegistrationLink"`
      )
    )
    for (const text of [
      'Scheme members report',
      'Organisation counts report',
      'Other reports'
    ]) {
      expect(result).toEqual(expect.stringContaining(text))
    }
  })

  test('has a year filter from 2010 to 2026 defaulting to 2026', async () => {
    const { result } = await getPage()

    expect(result).toEqual(
      expect.stringContaining('View submission counts for a different year')
    )
    expect(result).toEqual(
      expect.stringContaining('<option value="2026" selected>2026</option>')
    )
    expect(result).toEqual(expect.stringContaining('<option value="2010"'))
  })

  test('keeps the chosen year selected', async () => {
    const { result } = await getPage(
      `${paths.prototypeRegulatorRegistrations}?year=2024`
    )

    expect(result).toEqual(
      expect.stringContaining('<option value="2024" selected>2024</option>')
    )
  })

  test('shows the four task cards with counts', async () => {
    const { result } = await getPage()

    for (const key of [
      'direct-registrants',
      'applications-for-approval',
      'scheme-registrations',
      'scheme-member-lists'
    ]) {
      expect(result).toEqual(
        expect.stringContaining(
          `data-testid="regulator-registrations-card-${key}"`
        )
      )
    }
    expect(result).toEqual(
      expect.stringContaining('Review registration submissions')
    )
    expect(result).toEqual(
      expect.stringContaining('Review scheme member lists')
    )
  })

  test('renders govukTabs with counts computed from the cases', async () => {
    const { result } = await getPage()

    expect(result).toEqual(expect.stringContaining('govuk-tabs'))
    for (const label of [
      'All (5)',
      'Submitted (1)',
      'Payment issue (1)',
      'Not submitted (1)',
      'Pre reg (1)',
      'Registrations (1)'
    ]) {
      expect(result).toEqual(expect.stringContaining(label))
    }
  })

  test('lists the five cases in a govukTable with coloured status tags', async () => {
    const { result } = await getPage()

    const allTable = result.match(
      /<table[^>]*data-testid="regulator-registrations-table-all"[\s\S]*?<\/table>/
    )[0]
    for (const heading of [
      'Large producer',
      'Scheme',
      'Type',
      'Status',
      'Due date',
      'Previous years',
      'Case'
    ]) {
      expect(allTable).toEqual(expect.stringContaining(`>${heading}</th>`))
    }
    for (const name of [
      'Acme Battery Co',
      'Northline Power Ltd',
      'Cobalt Traction Systems',
      'GreenCell Storage',
      'Voltix Manufacturing'
    ]) {
      expect(allTable).toEqual(expect.stringContaining(name))
    }
    expect(allTable).toEqual(expect.stringContaining('1 Oct 2026'))
    expect(allTable).toEqual(expect.stringContaining('1 Apr 2026'))
    expect(allTable).toEqual(expect.stringContaining('2024: Not registered'))
    expect(allTable).toEqual(
      expect.stringContaining('govuk-tag govuk-tag--green')
    )
    expect(allTable).toEqual(
      expect.stringContaining('govuk-tag govuk-tag--orange')
    )
    expect(allTable).toEqual(
      expect.stringContaining('govuk-tag govuk-tag--grey')
    )
    expect(allTable).toEqual(
      expect.stringContaining('govuk-tag govuk-tag--yellow')
    )
  })
})
