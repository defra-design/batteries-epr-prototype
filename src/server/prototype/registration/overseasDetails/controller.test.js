import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationOverseasDetails', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the overseas form with the no-UK-presence exit link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationOverseasDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="overseas-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="overseas-no-uk-presence"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegistrationOverseasExit}"`
      )
    )
  })

  test('POST saves the overseas details using the overseas name as organisation name', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationOverseasDetails,
      payload: {
        overseasName: 'Übersee Batterien GmbH',
        overseasAddress: '1 Strasse, Berlin',
        addressPostcode: 'LS1 4DP'
      }
    })
    expect(result).toEqual(
      expect.stringContaining('"organisationName":"Übersee Batterien GmbH"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationAppropriatePersonGuidance}"`
      )
    )
  })

  test('POST without required fields redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationOverseasDetails,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationOverseasDetails,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-registration-error-summary"'
      )
    )
  })
})
