import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

const stepUrl = (step) =>
  paths.complianceSchemeApplication.replace('{step}', step)

describe('#complianceSchemeApplicationController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET scheme-details renders the form and a hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: stepUrl('scheme-details')
    })

    expect(statusCode).toBe(statusCodes.ok)
    const stepContent = content.complianceScheme({}).application.steps
      .schemeDetails
    expect(result).toEqual(expect.stringContaining(stepContent.heading))
    expect(result).toEqual(expect.stringContaining(stepContent.nameLabel))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"step":"scheme-details"'))
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

  test('POST valid scheme-details emits a persist payload with patch and next', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('scheme-details'),
      payload: 'name=Acme&tradingNames=Acme1%0AAcme2',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"name":"Acme"'))
    expect(result).toEqual(
      expect.stringContaining('"tradingNames":["Acme1","Acme2"]')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"next":"/compliance-scheme/application/registered-address"'
      )
    )
  })

  test('POST scheme-details missing name flashes errors and redirects', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: stepUrl('scheme-details'),
      payload: 'name=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(stepUrl('scheme-details'))
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
  })

  test('POST operational-plan valid emits an operationalPlan patch', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('operational-plan'),
      payload: 'operationalPlan=Some+plan',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(
      expect.stringContaining('"operationalPlan":"Some plan"')
    )
  })

  test('POST contact-address writes both contact and service-of-notice addresses', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('contact-address'),
      payload: 'line1=2+St&line2=Suite+1&town=Town&postcode=LS1+1AA',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"contactAddress"'))
    expect(result).toEqual(expect.stringContaining('"line2":"Suite 1"'))
    expect(result).toEqual(expect.stringContaining('"serviceOfNoticeAddress"'))
  })

  test('POST offences with yes requires details', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('offences'),
      payload: 'hasOffences=yes&offencesDetail=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST offences with no records null', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('offences'),
      payload: 'hasOffences=no',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"offences":null'))
  })

  test('POST offences with yes and detail records the detail', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('offences'),
      payload: 'hasOffences=yes&offencesDetail=A+past+offence',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(
      expect.stringContaining('"offences":"A past offence"')
    )
  })

  test('POST partners with empty value records an empty list', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('partners'),
      payload: 'partners=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"partners":[]'))
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
        '"next":"/compliance-scheme/application/confirmation"'
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
      url: stepUrl('scheme-details')
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('POST partners trims and splits the textarea into objects', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('partners'),
      payload: 'partners=Alpha%0A%0ABeta+Co%0A',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        '"partners":[{"name":"Alpha"},{"name":"Beta Co"}]'
      )
    )
  })

  test('POST additional-files records file names', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: stepUrl('additional-files'),
      payload: 'additionalFiles=plan.pdf%0Agovernance.docx',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        '"additionalFiles":[{"name":"plan.pdf"},{"name":"governance.docx"}]'
      )
    )
  })

  test('POST operational-plan empty redirects with error', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: stepUrl('operational-plan'),
      payload: 'operationalPlan=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
