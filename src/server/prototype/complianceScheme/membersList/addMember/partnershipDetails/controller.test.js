import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'

describe('#prototypeMembersListAddMemberPartnershipDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the form with the postcode field hinted, not a placeholder', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberPartnershipDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-full-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-partnership-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="details-postcode"')
    )
    expect(result).toEqual(expect.stringContaining('For example, AA3 1AB'))
    expect(result).not.toEqual(expect.stringContaining('>Hint<'))
  })

  test('POST with valid details saves them and continues to legal notices', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberPartnershipDetails,
      payload: {
        contactFullName: 'Jordan Ash',
        organisationName: 'Ash & Reed Partnership',
        addressPostcode: 'LS1 4DP'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"contactFullName":"Jordan Ash"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberLegalNoticesAddress}"`
      )
    )
  })

  test('POST without a postcode redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberPartnershipDetails,
      payload: { contactFullName: 'Jordan Ash', organisationName: 'Ash & Reed' }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberPartnershipDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="add-member-error-summary"')
    )
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberPartnershipDetails
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
