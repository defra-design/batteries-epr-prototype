import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

const stepUrl = (q, s) =>
  paths.operatorQuarterly.replace('{quarter}', q).replace('{step}', s)

describe('#operatorQuarterlyController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET tonnages renders the form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('Q1', 'tonnages')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('data-testid="operator-quarterly-form"'))
    expect(result).toEqual(expect.stringContaining('"view":"operatorQuarterly"'))
    expect(result).toEqual(expect.stringContaining('"step":"tonnages"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })

  test('GET unknown quarter returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('Q9', 'tonnages')
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

  test('GET confirmation renders the panel', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('Q3', 'confirmation')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-quarterly-confirmation-panel"')
    )
  })

  test('GET declaration renders the declaration page', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('Q2', 'declaration')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-quarterly-declaration"')
    )
    expect(result).toEqual(
      expect.stringContaining('"next":"/operator/quarterly/Q2/confirmation"')
    )
  })

  test('POST tonnages valid emits persist payload', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'tonnages'),
      payload: 'acceptedLeadAcid=1.000&acceptedNickelCadmium=2.000&acceptedOther=3.000&treatedLeadAcid=4.000&treatedNickelCadmium=5.000&treatedOther=6.000',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"status":"in-progress"'))
    expect(result).toEqual(
      expect.stringContaining('"next":"/operator/quarterly/Q1/declaration"')
    )
  })

  test('POST tonnages with non-numeric values redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'tonnages'),
      payload: 'acceptedLeadAcid=abc&acceptedNickelCadmium=2&acceptedOther=3&treatedLeadAcid=4&treatedNickelCadmium=5&treatedOther=6',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST tonnages with empty fields redirects', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'tonnages'),
      payload: 'acceptedLeadAcid=&acceptedNickelCadmium=&acceptedOther=&treatedLeadAcid=&treatedNickelCadmium=&treatedOther=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(stepUrl('Q1', 'tonnages'))
  })

  test('POST declaration valid sets status=submitted', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"status":"submitted"'))
    expect(result).toEqual(
      expect.stringContaining('"next":"/operator/quarterly/Q1/confirmation"')
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
      url: stepUrl('Q9', 'tonnages')
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
