import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

const stepUrl = (step) => paths.operatorAnnualReturn.replace('{step}', step)

const validTonnagePayload = [
  'industrialAcceptedLeadAcid=1.000',
  'industrialAcceptedNickelCadmium=2.000',
  'industrialAcceptedOther=3.000',
  'industrialTreatedLeadAcid=4.000',
  'industrialTreatedNickelCadmium=5.000',
  'industrialTreatedOther=6.000',
  'automotiveAcceptedLeadAcid=7.000',
  'automotiveAcceptedNickelCadmium=8.000',
  'automotiveAcceptedOther=9.000',
  'automotiveTreatedLeadAcid=10.000',
  'automotiveTreatedNickelCadmium=11.000',
  'automotiveTreatedOther=12.000'
].join('&')

describe('#operatorAnnualReturnController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET tonnages renders the form and a hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('tonnages')
    })

    expect(statusCode).toBe(statusCodes.ok)
    const stepContent = content.operator({}).annualPages.steps.tonnages
    expect(result).toEqual(expect.stringContaining(stepContent.heading))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"step":"tonnages"'))
  })

  test('GET unknown step returns 404', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('not-a-step')
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('GET confirmation renders the confirmation panel and dashboard link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('confirmation')
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-confirmation-panel"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="annual-return-confirmation-dashboard-link"'
      )
    )
  })

  test('POST valid tonnages emits a persist payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnages'),
      payload: validTonnagePayload,
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"status":"in-progress"'))
    expect(result).toEqual(
      expect.stringContaining('"next":"/operator/annual-return/declaration"')
    )
  })

  test('POST tonnages with invalid values redirects with errors', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnages'),
      payload: 'industrialAcceptedLeadAcid=abc',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(stepUrl('tonnages'))
  })

  test('POST declaration with checkbox emits submitted status', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"status":"submitted"'))
    expect(result).toEqual(
      expect.stringContaining('"next":"/operator/annual-return/confirmation"')
    )
  })

  test('POST declaration without checkbox redirects with errors', async () => {
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

  test('POST with no body redirects with validation errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('tonnages')
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET declaration renders the declaration page with confirm action', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('declaration')
    })

    expect(statusCode).toBe(statusCodes.ok)
    const annualPages = content.operator({}).annualPages
    expect(result).toEqual(expect.stringContaining(annualPages.confirmAction))
  })
})
