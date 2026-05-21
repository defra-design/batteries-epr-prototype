import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

describe('#membersAddController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the add form with bprn and companyName inputs', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeMembersAdd
    })

    expect(statusCode).toBe(statusCodes.ok)
    const addContent = content.complianceScheme({}).membersPages.add
    expect(result).toEqual(expect.stringContaining(addContent.heading))
    for (const id of [
      'members-add-form',
      'members-add-bprn',
      'members-add-company-name',
      'members-add-submit',
      'members-add-cancel'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining('"view":"add"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })

  test('POST valid emits a persist payload with the new member and next URL', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeMembersAdd,
      payload: 'bprn=BPRN-EA-2026-000010&companyName=Acme+Member',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining('"producerBprn":"BPRN-EA-2026-000010"')
    )
    expect(result).toEqual(
      expect.stringContaining('"companyName":"Acme Member"')
    )
    expect(result).toEqual(
      expect.stringContaining(`"next":"${paths.complianceSchemeMembers}"`)
    )
  })

  test('POST missing fields redirects with errors', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeMembersAdd,
      payload: 'bprn=&companyName=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.complianceSchemeMembersAdd)
  })

  test('POST malformed BPRN redirects (format error)', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeMembersAdd,
      payload: 'bprn=not-a-bprn&companyName=Acme',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST with no body still redirects with errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeMembersAdd
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
