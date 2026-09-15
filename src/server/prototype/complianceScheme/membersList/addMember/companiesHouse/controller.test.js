import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'

describe('#prototypeMembersListAddMemberCompaniesHouse', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the search form with hidden address fields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCompaniesHouse
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-number"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-search"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="companies-house-address-line1"')
    )
  })

  test('the back link returns to organisation type', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCompaniesHouse
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListAddMemberOrganisationType}"`
      )
    )
  })

  test('POST with a valid company saves the details and continues to legal notices', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberCompaniesHouse,
      payload: {
        organisationName: 'Demo Power Cells Ltd',
        companyNumber: '12345678',
        addressLine1: '1 Demo Way',
        addressTown: 'Manchester',
        addressPostcode: 'M1 4AA'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Demo Power Cells Ltd"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberLegalNoticesAddress}"`
      )
    )
  })

  test('POST with a bad company number redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberCompaniesHouse,
      payload: { organisationName: 'Demo', companyNumber: '123' }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCompaniesHouse,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="add-member-error-summary"')
    )
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCompaniesHouse
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
  })
})
