import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationAppropriatePersonGuidance', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the guidance with the who-can-act table and continue link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationAppropriatePersonGuidance
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Choosing the appropriate person for your organisation'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-roles-table"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegistrationAppropriatePerson}"`
      )
    )
  })
})
