import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationSchemeMembership', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the three membership radios', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationSchemeMembership
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-membership-yes"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-membership-no"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-membership-intend"')
    )
  })

  test('POST yes routes to scheme select', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSchemeMembership,
      payload: { schemeMembership: 'yes' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationSchemeSelect}"`
      )
    )
  })

  test('POST no skips ahead to check answers', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSchemeMembership,
      payload: { schemeMembership: 'no' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationCheckAnswers}"`
      )
    )
  })

  test('POST intendToJoin also skips ahead to check answers', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSchemeMembership,
      payload: { schemeMembership: 'intendToJoin' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeRegistrationCheckAnswers}"`
      )
    )
  })

  test('POST without a choice redirects back', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegistrationSchemeMembership,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
