import { createRequire } from 'node:module'

import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

describe('#prototypeComplianceSchemeSubmissionSubmissions', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the quarterly submissions page seeded from storage-seed.json', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    expect(statusCode).toBe(statusCodes.ok)

    const pageContent = prototypeComplianceSchemeContent.submissions
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-submissions-quarters"'
      )
    )

    for (const quarter of seedData.prototypeComplianceSchemeQuarters) {
      expect(result).toEqual(
        expect.stringContaining(`Q${quarter.quarter} ${quarter.year}`)
      )
      expect(result).toEqual(expect.stringContaining(quarter.note))
    }
  })

  test('Q1 is submitted with a grey tag and a view submission link', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-submissions-quarter-1"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="compliance-scheme-submissions-quarter-1-action"'
      )
    )
    expect(result).toEqual(expect.stringContaining('Submitted'))
    expect(result).toEqual(expect.stringContaining('View submission'))
  })

  test('Q2 is open with a green tag and a Primary link to the before-you-start page', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    const quarter2Link = result.match(
      /<a[^>]*data-testid="compliance-scheme-submissions-quarter-2-action"[^>]*>/
    )[0]

    expect(result).toEqual(expect.stringContaining('govuk-tag--green'))
    expect(result).toEqual(expect.stringContaining('Start Quarter 2'))
    expect(quarter2Link).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionBeforeYouStart.replace('{year}', '2026').replace('{quarter}', '2')}"`
      )
    )
    expect(quarter2Link).not.toEqual(
      expect.stringContaining('govuk-button--secondary')
    )
  })

  test('Q3 and Q4 are not yet open, use grey tags and a disabled action button', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    const quarter3Button = result.match(
      /<button[^>]*data-testid="compliance-scheme-submissions-quarter-3-action"[^>]*>/
    )[0]
    const quarter4Button = result.match(
      /<button[^>]*data-testid="compliance-scheme-submissions-quarter-4-action"[^>]*>/
    )[0]

    expect(quarter3Button).toEqual(expect.stringContaining('disabled'))
    expect(quarter4Button).toEqual(expect.stringContaining('disabled'))
    expect(result).toEqual(expect.stringContaining('Not yet open'))
    expect(result).toEqual(expect.stringContaining('Start Quarter 3'))
    expect(result).toEqual(expect.stringContaining('Start Quarter 4'))
  })

  test('Q1 action button is enabled, Secondary and rendered as a dead button (no href)', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    const quarter1Button = result.match(
      /<button[^>]*data-testid="compliance-scheme-submissions-quarter-1-action"[^>]*>/
    )[0]

    expect(quarter1Button).not.toEqual(expect.stringContaining('disabled'))
    expect(quarter1Button).toEqual(
      expect.stringContaining('govuk-button--secondary')
    )
  })

  test('all outgoing links are dead for now', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="compliance-scheme-submissions-member-detail"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="compliance-scheme-submissions-members-report"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="compliance-scheme-submissions-edit-status"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="compliance-scheme-submissions-general-availability"'
      )
    )
  })

  test('the Submissions tab is selected and Home is not highlighted', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionSubmissions}" data-testid="compliance-scheme-tab-submissions"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'govuk-tabs__list-item govuk-tabs__list-item--selected'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining('govuk-service-navigation__item--active')
    )
  })

  test('does not reproduce the pEPR service name or the header-bar navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })

  test('renders the data submission section and quarters before the general intro and evidence availability panel', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    const pageContent = prototypeComplianceSchemeContent.submissions
    const dataSubmissionIndex = result.indexOf(
      pageContent.dataSubmissionHeading
    )
    const quartersIndex = result.indexOf(
      'data-testid="compliance-scheme-submissions-quarters"'
    )
    const introIndex = result.indexOf(pageContent.intro)
    const evidenceIndex = result.indexOf(
      'data-testid="compliance-scheme-submissions-evidence"'
    )

    expect(dataSubmissionIndex).toBeGreaterThan(-1)
    expect(quartersIndex).toBeGreaterThan(dataSubmissionIndex)
    expect(introIndex).toBeGreaterThan(quartersIndex)
    expect(evidenceIndex).toBeGreaterThan(introIndex)
  })

  test('shows the standard header with the service name and masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeComplianceSchemeSubmissionSubmissions
    })

    expect(result).toEqual(expect.stringContaining('Home'))
    expect(result).toEqual(expect.stringContaining('Manage account'))
    expect(result).toEqual(expect.stringContaining('My profile'))
    expect(result).toEqual(expect.stringContaining('Sign out'))
  })
})
