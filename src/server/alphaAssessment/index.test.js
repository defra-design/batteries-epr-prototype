import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'

describe('#alphaAssessment', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('redirects the bare path to the index page so relative links resolve', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: paths.alphaAssessment
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(`${paths.alphaAssessment}/index.html`)
  })

  test('serves the presentation index as HTML', async () => {
    const { result, statusCode, headers } = await server.inject({
      method: 'GET',
      url: `${paths.alphaAssessment}/index.html`
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toEqual(
      expect.stringContaining('text/html')
    )
    expect(result).toEqual(
      expect.stringContaining('Batteries EPR · Alpha assessment')
    )
  })

  test('does not apply the app content security policy to the pages', async () => {
    const { headers } = await server.inject({
      method: 'GET',
      url: `${paths.alphaAssessment}/index.html`
    })

    expect(headers['content-security-policy']).toBeUndefined()
  })

  test('serves the sub-pages as HTML', async () => {
    const { result, statusCode, headers } = await server.inject({
      method: 'GET',
      url: `${paths.alphaAssessment}/alpha-plan.html`
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(headers['content-type']).toEqual(
      expect.stringContaining('text/html')
    )
    expect(result).toEqual(
      expect.stringContaining('Alpha plan · Batteries EPR')
    )
  })

  test('returns not found for a missing page', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: `${paths.alphaAssessment}/missing-page.html`
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
