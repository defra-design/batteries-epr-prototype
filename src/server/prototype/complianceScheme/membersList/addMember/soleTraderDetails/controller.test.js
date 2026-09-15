import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'

describe('#prototypeMembersListAddMemberSoleTraderDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the form without a partnership name field', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberSoleTraderDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-full-name"')
    )
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="details-partnership-name"')
    )
  })

  test('POST derives organisationName from trading name when given', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberSoleTraderDetails,
      payload: {
        contactFullName: 'Priya Shah',
        tradingName: 'Shah Cell Repairs',
        addressPostcode: 'LS1 4DP'
      }
    })
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Shah Cell Repairs"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberLegalNoticesAddress}"`
      )
    )
  })

  test('POST falls back to the full name when there is no trading name', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberSoleTraderDetails,
      payload: { contactFullName: 'Priya Shah', addressPostcode: 'LS1 4DP' }
    })
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Priya Shah"')
    )
  })

  test('POST without a postcode redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberSoleTraderDetails,
      payload: { contactFullName: 'Priya Shah' }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberSoleTraderDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="add-member-error-summary"')
    )
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberSoleTraderDetails
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
