import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeMembersListAddMemberUkBusinessPresence', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders both radios unchecked and the details guidance', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberUkBusinessPresence
    })
    expect(statusCode).toBe(statusCodes.ok)

    const yes = result.match(
      /<input[^>]*data-testid="uk-business-presence-yes"[^>]*>/
    )[0]
    const no = result.match(
      /<input[^>]*data-testid="uk-business-presence-no"[^>]*>/
    )[0]
    expect(yes).not.toEqual(expect.stringContaining('checked'))
    expect(no).not.toEqual(expect.stringContaining('checked'))

    const pageContent =
      prototypeComplianceSchemeContent.membersList.addMember.ukBusinessPresence
    expect(result).toEqual(expect.stringContaining(pageContent.detailsSummary))
  })

  test('POST yes routes to overseas details', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberUkBusinessPresence,
      payload: { ukBusinessPresence: 'yes' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberOverseasDetails}"`
      )
    )
  })

  test('POST no routes to the cannot-register exit', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberUkBusinessPresence,
      payload: { ukBusinessPresence: 'no' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberOverseasCannotRegister}"`
      )
    )
  })

  test('POST with an invalid value redirects back with errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberUkBusinessPresence,
      payload: { ukBusinessPresence: 'maybe' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberUkBusinessPresence
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
