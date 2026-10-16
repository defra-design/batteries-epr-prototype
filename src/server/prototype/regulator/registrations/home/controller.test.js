import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorHome', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const getHome = () =>
    server.inject({ method: 'GET', url: paths.prototypeRegulatorHome })

  test('renders the regulator layout: wordmark, service navigation, hero and footer', async () => {
    const { result, statusCode } = await getHome()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('images/defra-logo-wide.svg')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'alt="Department for Environment Food &amp; Rural Affairs"'
      )
    )
    expect(result).toEqual(expect.stringContaining('pEPR: Regulator'))
    for (const item of [
      'Registrations',
      'PoM submissions',
      'Compliance schemes',
      'Manage account'
    ]) {
      expect(result).toEqual(expect.stringContaining(`>${item}</a>`))
    }
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-hero"')
    )
    expect(result).toEqual(expect.stringContaining('app-regulator-footer'))
    // The old black GOV.UK header and the phase banner are not used
    expect(result).not.toEqual(expect.stringContaining('app-header'))
    expect(result).not.toEqual(expect.stringContaining('govuk-phase-banner'))
  })

  test('keeps a working Reset data link in the footer', async () => {
    const { result } = await getHome()

    expect(result).toEqual(expect.stringContaining(`href="${paths.devReset}"`))
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-reset-data"')
    )
  })

  test('shows the Dashboard heading and intro in the hero band', async () => {
    const { result } = await getHome()

    expect(result).toEqual(expect.stringContaining('>Dashboard</h1>'))
    expect(result).toEqual(
      expect.stringContaining('Environment Agency – batteries regulation')
    )
  })

  test('shows the quick links strip, linking Registrations to its dashboard', async () => {
    const { result } = await getHome()

    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-home-quick-links"')
    )
    expect(result).toMatch(
      new RegExp(
        `href="${paths.prototypeRegulatorRegistrations}"[^>]*data-testid="regulator-home-quick-links-registrations"`
      )
    )
    for (const link of [
      'PoM submissions',
      'Compliance schemes',
      'Manage account'
    ]) {
      expect(result).toEqual(expect.stringContaining(link))
    }
  })

  test('lists the five task cards with tags, descriptions and links', async () => {
    const { result } = await getHome()

    for (const key of [
      'registrations',
      'pom-submissions',
      'scheme-waste-data',
      'abto-waste-submissions',
      'abto-evidence-notes'
    ]) {
      expect(result).toEqual(
        expect.stringContaining(`data-testid="regulator-home-card-${key}"`)
      )
    }
    expect(result).toEqual(expect.stringContaining('1 awaiting decision'))
    expect(result).toEqual(expect.stringContaining('4 awaiting review'))
    expect(result).toEqual(
      expect.stringContaining('govuk-tag govuk-tag--orange')
    )
    expect(result).toEqual(expect.stringContaining('1 cancellation request'))
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorRegistrations}">View registrations</a>`
      )
    )
    expect(result).toEqual(expect.stringContaining('View evidence notes'))
  })

  test('lists the six grouped link lists', async () => {
    const { result } = await getHome()

    expect(result).toEqual(
      expect.stringContaining('Organisations, reports and reference data')
    )
    for (const key of [
      'organisations',
      'approvals-and-returns',
      'reports',
      'evidence',
      'reference-data',
      'public-registers'
    ]) {
      expect(result).toEqual(
        expect.stringContaining(`data-testid="regulator-home-links-${key}"`)
      )
    }
    expect(result).toEqual(expect.stringContaining('Orphaned producers'))
    expect(result).toEqual(expect.stringContaining('Batteries public register'))
  })
})
