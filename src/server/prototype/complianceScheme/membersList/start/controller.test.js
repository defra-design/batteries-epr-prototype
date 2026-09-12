import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

describe('#prototypeMembersListStart', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the start page with a start button to the how-to-send page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListStart
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Send your regulator your members list')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="members-list-start-button"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeMembersListHowToSend}"`)
    )
  })

  test('renders the intro, inset text and before-you-start bullets', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListStart
    })

    const pageContent = prototypeComplianceSchemeContent.membersList.start
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining('data-testid="members-list-start-inset-text"')
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.insetText.replace(/'/g, '&#39;'))
    )
    for (const bullet of pageContent.needBullets) {
      expect(result).toEqual(
        expect.stringContaining(bullet.replace(/'/g, '&#39;'))
      )
    }
  })

  test('renders the related content and guidance sidebar', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListStart
    })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="members-list-start-related-content"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Manage your compliance scheme account')
    )
    expect(result).toEqual(
      expect.stringContaining('Waste batteries: producer responsibility')
    )
  })

  test('the back link returns to the prototype index', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListStart
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(`href="${paths.prototype}"`)
    )
  })

  test('has no breadcrumbs', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListStart
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListStart
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
    expect(result).not.toEqual(expect.stringContaining('My profile'))
    expect(result).not.toEqual(expect.stringContaining('Sign out'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListStart
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
