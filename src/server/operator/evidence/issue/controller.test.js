import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'

const stepUrl = (step) => paths.operatorEvidenceIssue.replace('{step}', step)

const FIRST_SCHEME_ID = '22222222-0001-4000-a000-000000000001'

describe('#operatorEvidenceIssueController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET scheme renders the scheme selection step', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('scheme')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"step":"scheme"'))
  })

  test('GET unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('bogus')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST scheme with valid schemeId emits persist payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('scheme'),
      payload: `schemeId=${FIRST_SCHEME_ID}`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining(`"schemeId":"${FIRST_SCHEME_ID}"`)
    )
  })

  test('POST scheme without schemeId redirects with errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('scheme'),
      payload: '',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST tonnage with valid data emits persist payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnage'),
      payload:
        'category=portable&tonnes=1.500&wasteReceivedFrom=2026-01-01&wasteReceivedTo=2026-03-31',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"category":"portable"'))
    expect(result).toEqual(expect.stringContaining('"tonnes":"1.500"'))
    expect(result).toEqual(
      expect.stringContaining('"wasteReceivedFrom":"2026-01-01"')
    )
  })

  test('POST tonnage with invalid tonnes format redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnage'),
      payload:
        'category=portable&tonnes=abc&wasteReceivedFrom=2026-01-01&wasteReceivedTo=2026-03-31',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST tonnage with missing fields redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnage'),
      payload: '',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST declaration with yes emits commit patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"commit":true'))
  })

  test('POST declaration without checkbox redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('declaration'),
      payload: '',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST confirmation returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('confirmation')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('bogus')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
