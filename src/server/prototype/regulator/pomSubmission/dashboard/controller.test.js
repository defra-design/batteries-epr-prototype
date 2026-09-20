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

  test('renders the dashboard heading and service navigation', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionDashboard
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Regulator dashboard'))
    expect(result).toEqual(expect.stringContaining('Batteries: Regulator'))
    expect(result).toEqual(expect.stringContaining('Home'))
    expect(result).toEqual(expect.stringContaining('Manage account'))
    expect(result).toEqual(expect.stringContaining('My profile'))
    expect(result).toEqual(expect.stringContaining('Sign out'))
    expect(result).toEqual(
      expect.stringContaining('govuk-service-navigation__item--active')
    )
  })

  test('renders both dashboard tabs', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionDashboard
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-dashboard-tabs"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="regulator-dashboard-tab-registrations"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="regulator-dashboard-tab-pom-submissions"'
      )
    )
    expect(result).toEqual(expect.stringContaining('Registration cases'))
    expect(result).toEqual(expect.stringContaining('PoM submissions'))
  })

  test('renders the registrations table from seeded data, with corrected status tags', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionDashboard
    })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="regulator-dashboard-registrations-table"'
      )
    )
    expect(result).toEqual(expect.stringContaining('Acme Battery Co'))
    expect(result).toEqual(expect.stringContaining('Northline Power Ltd'))
    expect(result).toEqual(expect.stringContaining('Cobalt Traction Systems'))
    expect(result).toEqual(expect.stringContaining('Voltix Manufacturing'))

    // Figma tagged these rows' status "Registrations" in green, which both
    // repeats the column name and reuses green (success) for a merely
    // submitted, still-pending case. Corrected to "In progress" in blue.
    expect(result).not.toEqual(expect.stringContaining('>Registrations<'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue">\s*In progress\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*Payment issue\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--grey">\s*Not submitted\s*<\/strong>/)
    )
  })

  test('renders the PoM submissions table from seeded data', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionDashboard
    })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="regulator-dashboard-pom-submissions-table"'
      )
    )
    expect(result).toEqual(expect.stringContaining('IronWave Compliance'))
    expect(result).toEqual(expect.stringContaining('REPIC'))
    expect(result).toEqual(expect.stringContaining('Voltguard Batteries'))
    expect(result).toEqual(
      expect.stringContaining('Copper &amp; Co Compliance')
    )
    expect(result).toEqual(expect.stringContaining('BrightCell Compliance'))

    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--blue">\s*Received\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green">\s*Accepted\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange">\s*Queried\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(
        /govuk-tag--grey">\s*Not yet submitted\s*<\/strong>/
      )
    )
  })

  test('links the IronWave Compliance and REPIC rows to their scheme homes, and leaves every other scheme dead for now', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionDashboard
    })

    const ironwaveHref = pathTo(
      paths.prototypeRegulatorPomSubmissionSchemeHome,
      {
        schemeId: 'ironwave-compliance'
      }
    )
    const repicHref = pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
      schemeId: 'repic'
    })

    expect(result).toEqual(
      expect.stringContaining(
        `data-testid="regulator-dashboard-pom-view-ironwave-compliance"`
      )
    )
    expect(result).toEqual(expect.stringContaining(`href="${ironwaveHref}"`))

    expect(result).toEqual(
      expect.stringContaining(
        `data-testid="regulator-dashboard-pom-view-repic"`
      )
    )
    expect(result).toEqual(expect.stringContaining(`href="${repicHref}"`))

    const voltguardViewTag = result.match(
      /<a[^>]*data-testid="regulator-dashboard-pom-view-voltguard-batteries"[^>]*>/
    )[0]
    expect(voltguardViewTag).toEqual(expect.stringContaining('href="#"'))

    const copperCoViewTag = result.match(
      /<a[^>]*data-testid="regulator-dashboard-pom-view-copper-and-co-compliance"[^>]*>/
    )[0]
    expect(copperCoViewTag).toEqual(expect.stringContaining('href="#"'))
  })

  test('renders dead links for actions outside this batch of screens', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPomSubmissionDashboard
    })

    const allocateTag = result.match(
      /<a[^>]*data-testid="regulator-dashboard-allocate-case"[^>]*>/
    )[0]
    expect(allocateTag).toEqual(expect.stringContaining('href="#"'))

    const complianceCheckTag = result.match(
      /<a[^>]*data-testid="regulator-dashboard-run-compliance-check"[^>]*>/
    )[0]
    expect(complianceCheckTag).toEqual(expect.stringContaining('href="#"'))
  })
})
