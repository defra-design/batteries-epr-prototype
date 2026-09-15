import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'

describe('#prototypeMembersListAddMemberOverseasExit', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the overseas exit page with a change-answer link back to the UK presence question', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOverseasCannotRegister
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('You cannot register as an overseas company')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="overseas-exit-change-answer"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListAddMemberUkBusinessPresence}"`
      )
    )
  })

  test('renders a real govukWarningText component', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOverseasCannotRegister
    })
    expect(result).toEqual(expect.stringContaining('govuk-warning-text'))
  })

  test('the back link returns to the UK business presence question', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberOverseasCannotRegister
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListAddMemberUkBusinessPresence}"`
      )
    )
  })
})
