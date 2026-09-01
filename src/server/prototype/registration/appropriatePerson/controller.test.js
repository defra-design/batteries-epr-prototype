import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationAppropriatePerson', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the appropriate person form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationAppropriatePerson
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-email"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="appropriate-person-role"')
    )
  })

  test('POST saves the appropriate person and continues to scheme membership', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationAppropriatePerson,
      payload: {
        appropriatePersonName: 'Scarlet Elfcup',
        appropriatePersonEmail: 'scarlet@batteryproducer.co.uk',
        appropriatePersonRole: 'Director'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"appropriatePersonName":"Scarlet Elfcup"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationSchemeMembership}"`
      )
    )
  })

  test('POST with an invalid email redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationAppropriatePerson,
      payload: {
        appropriatePersonName: 'Scarlet Elfcup',
        appropriatePersonEmail: 'not-an-email',
        appropriatePersonRole: 'Director'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationAppropriatePerson,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-registration-error-summary"'
      )
    )
  })
})
