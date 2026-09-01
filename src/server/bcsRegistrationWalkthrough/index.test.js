import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#bcsRegistrationWalkthrough', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('serves the standalone walkthrough page as HTML', async () => {
    const { result, statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.bcsRegistrationWalkthrough
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toEqual(
      expect.stringContaining('text/html')
    )
    expect(result).toEqual(expect.stringContaining('BCS Registration on NPWD'))
  })

  test('does not apply the app content security policy to the page', async () => {
    const { headers } = await server.inject({
      method: 'GET',
      url: paths.bcsRegistrationWalkthrough
    })

    expect(headers['content-security-policy']).toBeUndefined()
  })

  test('serves the walkthrough screenshots as PNG images', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: `${paths.bcsRegistrationWalkthrough}/images/01-npwd-public-info.png`
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toEqual(
      expect.stringContaining('image/png')
    )
  })

  test('returns not found for a missing screenshot', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: `${paths.bcsRegistrationWalkthrough}/images/99-missing.png`
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
