import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeMembersListAddMemberBatteryCategory', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the category checkboxes and sidebar, none checked', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberBatteryCategory
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const testId of [
      'battery-category-portable',
      'battery-category-industrial',
      'battery-category-automotive'
    ]) {
      const input = result.match(
        new RegExp(`<input[^>]*data-testid="${testId}"[^>]*>`)
      )[0]
      expect(input).not.toEqual(expect.stringContaining('checked'))
    }
    expect(result).toEqual(
      expect.stringContaining('data-testid="battery-category-sidebar"')
    )
  })

  test('renders "Select all that apply" as a real fieldset hint, not a floating paragraph', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberBatteryCategory
    })

    const pageContent =
      prototypeComplianceSchemeContent.membersList.addMember.batteryCategory
    const hint = result.match(
      /<div id="isPortable-hint" class="govuk-hint">([^<]*)<\/div>/
    )
    expect(hint).not.toBeNull()
    expect(hint[1].trim()).toBe(pageContent.hint)
  })

  test('POST with categories selected continues to tonnage', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberBatteryCategory,
      payload: { isPortable: 'on', isIndustrial: 'on' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"isPortable":true'))
    expect(result).toEqual(expect.stringContaining('"isIndustrial":true'))
    expect(result).toEqual(expect.stringContaining('"isAutomotive":false'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberTonnage}"`
      )
    )
  })

  test('POST with nothing selected redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberBatteryCategory,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberBatteryCategory,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="add-member-error-summary"')
    )
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberBatteryCategory
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
