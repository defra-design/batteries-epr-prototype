import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#account/scheme', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the loading shell and edit link to the scheme-select wizard step', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.accountScheme
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-scheme-loading"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-scheme-content"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.onboardingSchemeSelect}?return=${encodeURIComponent(paths.accountScheme)}`
      )
    )
  })

  test('GET passes a page payload with labels for client hydration', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.accountScheme
    })
    expect(result).toEqual(expect.stringContaining('"timelineActive":'))
    expect(result).toEqual(expect.stringContaining('"notFoundName":'))
  })
})
