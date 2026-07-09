import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

const stepUrl = (q, s) =>
  paths.complianceSchemeQuarterly.replace('{quarter}', q).replace('{step}', s)

const memberUrl = (q, memberId, dataType) =>
  paths.complianceSchemeQuarterlyMember
    .replace('{quarter}', q)
    .replace('{memberId}', memberId)
    .replace('{dataType}', dataType)

describe('#complianceSchemeQuarterlyController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET member-list renders the member list view', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('Q1', 'member-list')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="quarterly-member-list-table"')
    )
    expect(result).toEqual(expect.stringContaining('"view":"quarterly"'))
    expect(result).toEqual(expect.stringContaining('"step":"member-list"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })

  test('GET unknown quarter returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('Q9', 'member-list')
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

  test('GET check-answers renders the summary table', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('Q2', 'check-answers')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="quarterly-check-table"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/quarterly/Q2/declaration"'
      )
    )
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

  test('POST declaration valid sets status=submitted with confirmation next', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('Q1', 'declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"status":"submitted"'))
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

  test('POST unknown quarter returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('Q9', 'declaration')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET member market-data renders the member tonnes form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: memberUrl('Q1', 'test-member-id', 'market-data')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="quarterly-member-form"')
    )
    expect(result).toEqual(expect.stringContaining('"view":"quarterly-member"'))
    expect(result).toEqual(
      expect.stringContaining('"memberId":"test-member-id"')
    )
  })

  test('GET member unknown dataType returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: memberUrl('Q1', 'test-member-id', 'unknown')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST member market-data valid emits persist payload', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: memberUrl('Q1', 'test-member-id', 'market-data'),
      payload: 'portable=1.500&industrial=2.000&automotive=0.250',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"marketData"'))
    expect(result).toEqual(expect.stringContaining('"portable":"1.500"'))
  })

  test('POST member market-data non-numeric redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: memberUrl('Q1', 'test-member-id', 'market-data'),
      payload: 'portable=abc&industrial=2&automotive=3',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST member unknown dataType returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: memberUrl('Q1', 'test-member-id', 'unknown'),
      payload: 'portable=1&industrial=2&automotive=3',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST member market-data missing fields redirects', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: memberUrl('Q1', 'test-member-id', 'market-data'),
      payload: 'portable=&industrial=&automotive=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      memberUrl('Q1', 'test-member-id', 'market-data')
    )
  })
})
