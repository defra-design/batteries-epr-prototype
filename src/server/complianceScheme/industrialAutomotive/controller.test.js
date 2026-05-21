import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

const stepUrl = (s) => paths.complianceSchemeIa.replace('{step}', s)

describe('#complianceSchemeIaController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET placed renders the tonnes form with hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('placed')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-tonnes-industrial"')
    )
    expect(result).toEqual(expect.stringContaining('"view":"ia"'))
    expect(result).toEqual(expect.stringContaining('"step":"placed"'))
    expect(result).toEqual(
      expect.stringContaining('"compliancePeriodYear":"2026"')
    )
  })

  test('GET unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('not-a-step')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET check-answers renders the four section slots', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('check-answers')
    })
    for (const id of [
      'ia-check-placed',
      'ia-check-exported',
      'ia-check-taken-back',
      'ia-check-delivered'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
  })

  test('GET confirmation renders the panel', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('confirmation')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-confirmation-panel"')
    )
  })

  test('POST placed valid emits persist payload with placed patch and next=exported', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('placed'),
      payload: 'industrial=10.000&automotive=5.000',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"placed"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/industrial-automotive/exported"'
      )
    )
  })

  test('POST exported valid emits persist payload with exported patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('exported'),
      payload: 'industrial=1&automotive=0.5',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"exported"'))
  })

  test('POST taken-back valid emits persist payload with takenBack patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('taken-back'),
      payload: 'industrial=2&automotive=1',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"takenBack"'))
  })

  test('POST delivered valid emits persist payload with delivered patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('delivered'),
      payload: 'industrial=3&automotive=2',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"delivered"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/industrial-automotive/check-answers"'
      )
    )
  })

  test('POST placed missing fields redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('placed'),
      payload: 'industrial=&automotive=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST placed non-numeric redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('placed'),
      payload: 'industrial=abc&automotive=1',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST declaration valid sets status=submitted with confirmation next', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"status":"submitted"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/industrial-automotive/confirmation"'
      )
    )
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

  test('POST check-answers / confirmation / unknown all return 404', async () => {
    for (const step of ['check-answers', 'confirmation', 'wat']) {
      const { statusCode } = await server.inject({
        method: 'POST',
        url: stepUrl(step)
      })
      expect(statusCode).toBe(statusCodes.notFound)
    }
  })
})
