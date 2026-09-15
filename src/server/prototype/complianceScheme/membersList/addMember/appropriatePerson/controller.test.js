import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeMembersListAddMemberAppropriatePerson', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the guidance details, roles table and the name/email fields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberAppropriatePerson
    })
    expect(statusCode).toBe(statusCodes.ok)

    const pageContent =
      prototypeComplianceSchemeContent.membersList.addMember.appropriatePerson
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-details"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-roles-table"')
    )
    for (const row of pageContent.whoRows) {
      expect(result).toEqual(expect.stringContaining(row.organisation))
      expect(result).toEqual(expect.stringContaining(row.role))
    }
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-email"')
    )
  })

  test('POST with valid details continues to battery category', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberAppropriatePerson,
      payload: {
        appropriatePersonName: 'Scarlet Elfcup',
        appropriatePersonEmail: 'scarlet@example.com'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"appropriatePersonName":"Scarlet Elfcup"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberBatteryCategory}"`
      )
    )
  })

  test('POST with an invalid email redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberAppropriatePerson,
      payload: {
        appropriatePersonName: 'Scarlet Elfcup',
        appropriatePersonEmail: 'not-an-email'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberAppropriatePerson,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="add-member-error-summary"')
    )
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberAppropriatePerson
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
