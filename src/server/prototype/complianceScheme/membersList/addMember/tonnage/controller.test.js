import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'

describe('#prototypeMembersListAddMemberTonnage', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders both tonnage band radios unchecked', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberTonnage
    })
    expect(statusCode).toBe(statusCodes.ok)

    const upTo = result.match(
      /<input[^>]*data-testid="tonnage-up-to-1-tonne"[^>]*>/
    )[0]
    const over = result.match(
      /<input[^>]*data-testid="tonnage-over-1-tonne"[^>]*>/
    )[0]
    expect(upTo).not.toEqual(expect.stringContaining('checked'))
    expect(over).not.toEqual(expect.stringContaining('checked'))
  })

  test('POST saves the band and continues to date joined', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberTonnage,
      payload: { tonnageBand: 'upTo1Tonne' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"tonnageBand":"upTo1Tonne"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberDateJoined}"`
      )
    )
  })

  test('POST with an invalid value redirects back with errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberTonnage,
      payload: { tonnageBand: 'lots' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberTonnage
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
