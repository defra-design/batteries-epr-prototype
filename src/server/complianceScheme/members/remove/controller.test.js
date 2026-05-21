import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'

const removeUrl = (id) =>
  paths.complianceSchemeMemberRemove.replace('{memberId}', id)

describe('#membersRemoveController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the confirmation with the memberId in the payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: removeUrl('member-abc')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"view":"remove"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"memberId":"member-abc"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="members-remove-confirm"')
    )
  })

  test('POST emits a persist payload with the memberId and next URL', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: removeUrl('member-abc')
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"memberId":"member-abc"'))
    expect(result).toEqual(
      expect.stringContaining(`"next":"${paths.complianceSchemeMembers}"`)
    )
  })
})
