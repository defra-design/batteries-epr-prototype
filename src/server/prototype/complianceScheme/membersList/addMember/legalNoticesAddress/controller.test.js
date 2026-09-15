import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeMembersListAddMemberLegalNoticesAddress', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders real hints, not the "Hint" placeholder', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberLegalNoticesAddress
    })
    expect(statusCode).toBe(statusCodes.ok)

    const pageContent =
      prototypeComplianceSchemeContent.membersList.addMember.legalNoticesAddress
    expect(result).toEqual(expect.stringContaining(pageContent.postcodeHint))
    expect(result).toEqual(expect.stringContaining(pageContent.buildingHint))
    expect(result).not.toEqual(expect.stringContaining('>Hint<'))
  })

  test('POST with valid details continues to the appropriate person screen', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberLegalNoticesAddress,
      payload: {
        legalNoticesPostcode: 'AA3 1AB',
        legalNoticesBuilding: '15'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"legalNoticesPostcode":"AA3 1AB"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberAppropriatePerson}"`
      )
    )
  })

  test('POST without a building number redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberLegalNoticesAddress,
      payload: { legalNoticesPostcode: 'AA3 1AB' }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberLegalNoticesAddress,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="add-member-error-summary"')
    )
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberLegalNoticesAddress
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
