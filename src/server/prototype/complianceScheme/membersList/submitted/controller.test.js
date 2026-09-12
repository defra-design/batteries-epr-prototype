import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeMembersListSubmitted', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the confirmation panel and next-steps copy', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListSubmitted
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.membersList.submitted
    expect(result).toEqual(
      expect.stringContaining('data-testid="submitted-panel"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.panelBody))
    expect(result).toEqual(expect.stringContaining(pageContent.nextHeading))
    expect(result).toEqual(expect.stringContaining(pageContent.nextBody))
  })

  test('the filename placeholder is hydrated client-side, so renders a dash by default', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListSubmitted
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="submitted-filename">—')
    )
  })

  test('the back-to-prototype button links to the prototype index', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListSubmitted
    })

    const button = result.match(
      /<a[^>]*data-testid="submitted-back-to-prototype"[^>]*>/
    )[0]
    expect(button).toEqual(expect.stringContaining(`href="${paths.prototype}"`))
  })

  test('the back link returns to review-upload', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListSubmitted
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListReviewUpload}"`
      )
    )
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListSubmitted
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListSubmitted
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
