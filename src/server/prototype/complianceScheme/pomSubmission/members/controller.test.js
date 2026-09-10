import { createRequire } from 'node:module'

import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

describe('#prototypeComplianceSchemeSubmissionMembers', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the members table seeded from storage-seed.json', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionMembers
    })

    expect(statusCode).toBe(statusCodes.ok)

    const pageContent = prototypeComplianceSchemeContent.members
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining('data-testid="compliance-scheme-members-table"')
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.columns.memberName)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.columns.companyRegistrationNo)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.columns.memberSince)
    )
    expect(result).toEqual(expect.stringContaining(pageContent.columns.status))

    for (const member of seedData.prototypeComplianceSchemeMembers) {
      const escapedCompanyName = member.companyName.replace(/&/g, '&amp;')
      expect(result).toEqual(expect.stringContaining(escapedCompanyName))
      expect(result).toEqual(
        expect.stringContaining(member.companyRegistrationNo)
      )
    }
  })

  test('renders active members with a green tag and pending review members with a yellow tag', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionMembers
    })

    expect(result).toEqual(expect.stringContaining('govuk-tag--green'))
    expect(result).toEqual(expect.stringContaining('govuk-tag--yellow'))
    expect(result).toEqual(expect.stringContaining('Active'))
    expect(result).toEqual(expect.stringContaining('Pending review'))
  })

  test('add a new member and download links are dead for now', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionMembers
    })

    const addButtonTag = result.match(
      /<a[^>]*data-testid="compliance-scheme-members-add"[^>]*>/
    )[0]
    expect(addButtonTag).toEqual(expect.stringContaining('href="#"'))

    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="compliance-scheme-members-download"'
      )
    )
  })

  test('the Members tab is selected, the Submissions tab is dead and Home is not highlighted', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionMembers
    })

    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionMembers}" data-testid="compliance-scheme-tab-members"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'govuk-tabs__list-item govuk-tabs__list-item--selected'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionSubmissions}" data-testid="compliance-scheme-tab-submissions"`
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining('govuk-service-navigation__item--active')
    )
  })

  test('shows the standard header with the service name and navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionMembers
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).toEqual(expect.stringContaining('Home'))
    expect(result).toEqual(expect.stringContaining('Manage account'))
    expect(result).toEqual(expect.stringContaining('My profile'))
    expect(result).toEqual(expect.stringContaining('Sign out'))
  })
})
