import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

const stepUrl = (step) =>
  paths.operatorApplication.replace('{step}', step)

describe('#operatorApplicationController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET operator-details renders the form and a hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('operator-details')
    })

    expect(statusCode).toBe(statusCodes.ok)
    const stepContent =
      content.operator({}).application.steps.operatorDetails
    expect(result).toEqual(expect.stringContaining(stepContent.heading))
    expect(result).toEqual(expect.stringContaining(stepContent.nameLabel))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(
      expect.stringContaining('"step":"operator-details"')
    )
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
      expect.stringContaining('data-testid="application-confirmation-panel"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="application-confirmation-dashboard-link"'
      )
    )
  })

  test('POST valid operator-details emits a persist payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('operator-details'),
      payload:
        'name=Green+Recycling&approvalType=abto&companyRegistrationNo=12345678',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining('"name":"Green Recycling"')
    )
    expect(result).toEqual(
      expect.stringContaining('"approvalType":"abto"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/operator/application/registered-address"'
      )
    )
  })

  test('POST operator-details missing name flashes errors and redirects', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: stepUrl('operator-details'),
      payload: 'name=&approvalType=abto&companyRegistrationNo=12345678',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(stepUrl('operator-details'))
  })

  test('POST operator-details missing approvalType redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('operator-details'),
      payload: 'name=X&companyRegistrationNo=12345678',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST registered-address with invalid postcode redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('registered-address'),
      payload: 'line1=1+St&town=Town&postcode=NOTAPOSTCODE',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST registered-address valid emits a registeredAddress patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('registered-address'),
      payload: 'line1=1+St&town=Town&postcode=LS1+1AA',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(
      expect.stringContaining('"registeredAddress":{"line1":"1 St"')
    )
    expect(result).toEqual(
      expect.stringContaining('"next":"/operator/application/site-details"')
    )
  })

  test('POST site-details valid emits a site and batteryTypes patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('site-details'),
      payload:
        'siteName=Main+Site&siteLine1=1+Way&siteTown=Sheffield&sitePostcode=S1+1AA&isPortable=yes&isIndustrial=yes&operationsDescription=Treatment',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining('"isPortable":true')
    )
    expect(result).toEqual(
      expect.stringContaining('"isIndustrial":true')
    )
    expect(result).toEqual(
      expect.stringContaining('"isAutomotive":false')
    )
    expect(result).toEqual(
      expect.stringContaining('"name":"Main Site"')
    )
    expect(result).toEqual(
      expect.stringContaining('"operationsDescription":"Treatment"')
    )
  })

  test('POST site-details missing fields redirects with errors', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('site-details'),
      payload: 'siteName=&siteLine1=&siteTown=&sitePostcode=&operationsDescription=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST declaration sets approvalStatus=submitted and next=confirmation', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('declaration'),
      payload: 'declarationAccepted=yes',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(
      expect.stringContaining('"approvalStatus":"submitted"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/operator/application/confirmation"'
      )
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
      url: stepUrl('operator-details')
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
