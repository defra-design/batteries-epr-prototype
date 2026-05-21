import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

describe('#membersListController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the members list shell with active and history slots', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeMembers
    })

    expect(statusCode).toBe(statusCodes.ok)
    const listContent = content.complianceScheme({}).membersPages.list
    expect(result).toEqual(expect.stringContaining(listContent.heading))
    for (const id of [
      'members-active-body',
      'members-active-empty',
      'members-history-body',
      'members-history-empty',
      'members-add-link',
      'members-back-link'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
  })

  test('emits a page-payload with view=list, removeTemplate URL and copy', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeMembers
    })
    expect(result).toEqual(expect.stringContaining('"view":"list"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"removeTemplate":"/compliance-scheme/members/{memberId}/remove"'
      )
    )
    expect(result).toEqual(expect.stringContaining('"copy"'))
    expect(result).toEqual(expect.stringContaining('"compliancePeriodYear":"2026"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="members-period">2026')
    )
  })
})
