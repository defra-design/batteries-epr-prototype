import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'

const stepUrl = (s) =>
  paths.complianceSchemeEvidenceIssue.replace('{step}', s)

describe('#evidenceIssueController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET recipient renders the radio shell + hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('recipient')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"view":"issue"'))
    expect(result).toEqual(expect.stringContaining('"step":"recipient"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="evidence-issue-recipient-radios"'
      )
    )
  })

  test('GET unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('bogus')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET confirmation renders the panel', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: stepUrl('confirmation')
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-issue-confirmation-panel"')
    )
  })

  test('POST recipient valid emits persist payload + next=tonnes', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('recipient'),
      payload: 'recipientBprn=BPRN-EA-2026-000001',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining('"recipientBprn":"BPRN-EA-2026-000001"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/evidence/issue/tonnes"'
      )
    )
  })

  test('POST recipient missing redirects with flash', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('recipient'),
      payload: 'recipientBprn=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST tonnes valid emits persist payload with category + tonnes', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnes'),
      payload: 'category=portable&tonnes=2.500',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"category":"portable"'))
    expect(result).toEqual(expect.stringContaining('"tonnes":"2.500"'))
  })

  test('POST tonnes bad category redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnes'),
      payload: 'category=wat&tonnes=1',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST tonnes non-numeric redirects (format error)', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnes'),
      payload: 'category=portable&tonnes=abc',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST declaration valid emits commit patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"commit":true'))
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/evidence/issue/confirmation"'
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

  test('POST confirmation / unknown returns 404', async () => {
    for (const step of ['confirmation', 'bogus']) {
      const { statusCode } = await server.inject({
        method: 'POST',
        url: stepUrl(step)
      })
      expect(statusCode).toBe(statusCodes.notFound)
    }
  })
})
