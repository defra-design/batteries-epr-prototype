import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeMembersListHowToSend', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the form with neither radio pre-selected', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListHowToSend
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('How do you want to send your members list?')
    )

    const onlineForm = result.match(
      /<input[^>]*data-testid="how-to-send-online-form"[^>]*>/
    )[0]
    const csv = result.match(
      /<input[^>]*data-testid="how-to-send-csv"[^>]*>/
    )[0]
    expect(onlineForm).not.toEqual(expect.stringContaining('checked'))
    expect(csv).not.toEqual(expect.stringContaining('checked'))
  })

  test('renders the hints and back link to the start page', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListHowToSend
    })

    const pageContent = prototypeComplianceSchemeContent.membersList.howToSend
    expect(result).toEqual(expect.stringContaining(pageContent.onlineFormHint))
    expect(result).toEqual(expect.stringContaining(pageContent.csvHint))

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(`href="${paths.prototypeMembersListStart}"`)
    )
  })

  test('POST without a selection re-renders with an error summary and inline error', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListHowToSend,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.membersList.howToSend
    expect(result).toEqual(
      expect.stringContaining('data-testid="how-to-send-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.error.message))
    expect(result).toEqual(expect.stringContaining('href="#sendMethod"'))
  })

  test('POST with "csv" persists the choice and gives a nextStep to the upload-csv screen', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListHowToSend,
      payload: { sendMethod: 'csv' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'save',
      savedFields: { sendMethod: 'csv' },
      nextStep: paths.prototypeMembersListUploadCsv
    })
  })

  test('POST with "onlineForm" gives a nextStep to the add-member placeholder', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListHowToSend,
      payload: { sendMethod: 'onlineForm' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'save',
      savedFields: { sendMethod: 'onlineForm' },
      nextStep: paths.prototypeMembersListAddMember
    })
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListHowToSend
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
    expect(result).not.toEqual(expect.stringContaining('My profile'))
    expect(result).not.toEqual(expect.stringContaining('Sign out'))
  })

  test('has no breadcrumbs', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListHowToSend
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListHowToSend
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
