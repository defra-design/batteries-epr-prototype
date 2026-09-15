import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'

describe('#prototypeMembersListAddMemberOrganisationType', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders all five organisation type radios, none pre-selected', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOrganisationType
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const testId of [
      'organisation-type-limited-company',
      'organisation-type-llp',
      'organisation-type-partnership',
      'organisation-type-sole-trader',
      'organisation-type-overseas'
    ]) {
      const input = result.match(
        new RegExp(`<input[^>]*data-testid="${testId}"[^>]*>`)
      )[0]
      expect(input).not.toEqual(expect.stringContaining('checked'))
    }
  })

  test('the back link returns to how-to-send', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOrganisationType
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(`href="${paths.prototypeMembersListHowToSend}"`)
    )
  })

  const branchCases = [
    ['limitedCompany', paths.prototypeMembersListAddMemberCompaniesHouse],
    ['llp', paths.prototypeMembersListAddMemberCompaniesHouse],
    ['partnership', paths.prototypeMembersListAddMemberPartnershipDetails],
    ['soleTrader', paths.prototypeMembersListAddMemberSoleTraderDetails],
    ['overseas', paths.prototypeMembersListAddMemberUkBusinessPresence]
  ]

  for (const [value, expected] of branchCases) {
    test(`POST ${value} routes to its detail page`, async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: paths.prototypeMembersListAddMemberOrganisationType,
        payload: { organisationType: value }
      })
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining(`"organisationType":"${value}"`)
      )
      expect(result).toEqual(
        expect.stringContaining(`"nextStep":"${expected}"`)
      )
    })
  }

  test('POST with an invalid value redirects back with errors', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberOrganisationType,
      payload: { organisationType: 'charity' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      paths.prototypeMembersListAddMemberOrganisationType
    )
  })

  test('the redirected GET renders an error summary and inline error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberOrganisationType,
      payload: { organisationType: 'charity' }
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]

    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOrganisationType,
      headers: { cookie }
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="add-member-error-summary"')
    )
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOrganisationType
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
    expect(result).not.toEqual(expect.stringContaining('My profile'))
    expect(result).not.toEqual(expect.stringContaining('Sign out'))
  })

  test('has no breadcrumbs', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOrganisationType
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOrganisationType
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
