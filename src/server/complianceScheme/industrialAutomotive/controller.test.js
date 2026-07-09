import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

const stepUrl = (s) => paths.complianceSchemeIa.replace('{step}', s)

const memberUrl = (memberId, step) =>
  paths.complianceSchemeIaMember
    .replace('{memberId}', memberId)
    .replace('{step}', step)

describe('#complianceSchemeIaController', () => {
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
      url: stepUrl('member-list')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-member-list-table"')
    )
    expect(result).toEqual(expect.stringContaining('"view":"ia"'))
    expect(result).toEqual(expect.stringContaining('"step":"member-list"'))
  })

  test('GET unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('not-a-step')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET check-answers renders the summary table', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('check-answers')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-check-table"')
    )
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

  test('GET member placed renders the member tonnes form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: memberUrl('test-member-id', 'placed')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-member-form"')
    )
    expect(result).toEqual(expect.stringContaining('"view":"ia-member"'))
    expect(result).toEqual(
      expect.stringContaining('"memberId":"test-member-id"')
    )
  })

  test('GET member unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: memberUrl('test-member-id', 'unknown')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST member placed valid emits persist payload', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: memberUrl('test-member-id', 'placed'),
      payload: 'industrial=10.000&automotive=5.000',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"placed"'))
  })

  test('POST member delivered valid navigates back to member-list', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: memberUrl('test-member-id', 'delivered'),
      payload: 'industrial=3&automotive=2',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/industrial-automotive/member-list"'
      )
    )
  })

  test('POST member placed non-numeric redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: memberUrl('test-member-id', 'placed'),
      payload: 'industrial=abc&automotive=1',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST member unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: memberUrl('test-member-id', 'unknown'),
      payload: 'industrial=1&automotive=2',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('POST member placed missing fields redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: memberUrl('test-member-id', 'placed'),
      payload: 'industrial=&automotive=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
