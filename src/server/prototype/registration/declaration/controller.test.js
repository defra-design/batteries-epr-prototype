import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationDeclaration', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the declaration bullets and accept-and-send button', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationDeclaration
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Declaration'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="declaration-submit"')
    )
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })

  test('POST emits a submit payload pointing at the complete page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationDeclaration,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"submit"'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationComplete}"`
      )
    )
  })
})
