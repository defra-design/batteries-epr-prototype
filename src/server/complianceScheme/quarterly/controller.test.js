import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

const stepUrl = (q, s) =>
  paths.complianceSchemeQuarterly.replace('{quarter}', q).replace('{step}', s)

describe('#complianceSchemeQuarterlyController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET market-data renders the tonnes form with hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('Q1', 'market-data')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('data-testid="tonnes-portable"'))
    expect(result).toEqual(expect.stringContaining('"view":"quarterly"'))
    expect(result).toEqual(expect.stringContaining('"quarter":"Q1"'))
    expect(result).toEqual(expect.stringContaining('"step":"market-data"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"compliancePeriodYear":"2026"'))
  })

  test('GET unknown quarter returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('Q9', 'market-data')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('Q1', 'wat')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET check-answers renders the summary slots', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('Q2', 'check-answers')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="quarterly-check-market-portable"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="quarterly-check-waste-portable"')
    )
    expect(result).toEqual(expect.stringContaining('"next":"/compliance-scheme/quarterly/Q2/declaration"'))
  })

  test('GET confirmation renders the panel', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('Q3', 'confirmation')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="quarterly-confirmation-panel"')
    )
  })

  test('POST market-data valid emits persist payload with marketData patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'market-data'),
      payload: 'portable=1.500&industrial=2.000&automotive=0.250',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"marketData"'))
    expect(result).toEqual(expect.stringContaining('"portable":"1.500"'))
    expect(result).toEqual(
      expect.stringContaining('"next":"/compliance-scheme/quarterly/Q1/waste-data"')
    )
  })

  test('POST market-data missing fields redirects', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'market-data'),
      payload: 'portable=&industrial=&automotive=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(stepUrl('Q1', 'market-data'))
  })

  test('POST market-data non-numeric redirects (format error path)', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'market-data'),
      payload: 'portable=abc&industrial=2&automotive=3',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST waste-data valid emits persist payload with wasteData and next=check-answers', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'waste-data'),
      payload: 'portable=0.500&industrial=0.250&automotive=0',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"wasteData"'))
    expect(result).toEqual(
      expect.stringContaining('"next":"/compliance-scheme/quarterly/Q1/check-answers"')
    )
  })

  test('POST declaration valid sets status=submitted with confirmation next', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(
      expect.stringContaining('"status":"submitted"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/quarterly/Q1/confirmation"'
      )
    )
  })

  test('POST declaration without checkbox redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'declaration'),
      payload: '',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST to check-answers returns 404 (not a form step)', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'check-answers')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST to confirmation returns 404 (not a form step)', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'confirmation')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST unknown quarter returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q9', 'market-data')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'wat')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
