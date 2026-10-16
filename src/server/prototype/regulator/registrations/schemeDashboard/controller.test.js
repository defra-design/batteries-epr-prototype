import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { applicationPath } from '../applicationShared.js'
import { resetRegistrationsStore, saveMemberListDecision } from '../store.js'

const urlFor = (schemeId) =>
  applicationPath(paths.prototypeRegulatorScheme, { schemeId })

describe('#prototypeRegulatorSchemeDashboard', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    resetRegistrationsStore()
  })

  const get = (schemeId = 'ironwave-compliance') =>
    server.inject({ method: 'GET', url: urlFor(schemeId) })

  test('renders the breadcrumb, scheme name H1 with a status tag and service navigation', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatch(/<h1[^>]*>\s*IronWave Compliance/)
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-status-tag"')
    )
    expect(result).toMatch(/>\s*Registered scheme\s*</)
    expect(result).toEqual(expect.stringContaining('>Compliance schemes</a>'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-nav-registrations"')
    )
  })

  test('shows the summary list with the seeded NPWD code, approval date and member counts', async () => {
    const { result } = await get()
    const list = result
      .split('data-testid="scheme-summary"')[1]
      .split('</dl>')[0]

    expect(list.split('govuk-summary-list__row').length - 1).toBe(3)
    expect(list).toEqual(expect.stringContaining('NPWD378112'))
    expect(list).toEqual(expect.stringContaining('15 January 2026'))
    expect(list).toEqual(
      expect.stringContaining('5 registered, 5 awaiting decision')
    )
  })

  test('shows the member list task with an action-needed tag and a button to the review', async () => {
    const { result } = await get()

    expect(result).toEqual(expect.stringContaining('Member list to review'))
    expect(result).toMatch(/govuk-tag--orange[^>]*>\s*Action needed\s*</)
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance has submitted a member list of 5 producers.'
      )
    )
    expect(result).toEqual(expect.stringContaining('Received 12 August 2026'))
    expect(result).toEqual(
      expect.stringContaining(
        `href="${applicationPath(paths.prototypeRegulatorSchemeMemberList, { schemeId: 'ironwave-compliance' })}"`
      )
    )
    expect(result).toEqual(expect.stringContaining('Review member list'))
  })

  test('lists the four scheme links with their counts', async () => {
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining('Applications for approval (0)')
    )
    expect(result).toEqual(
      expect.stringContaining('Compliance scheme members (5)')
    )
    expect(result).toEqual(expect.stringContaining('Quarterly PoM returns (0)'))
    expect(result).toEqual(
      expect.stringContaining('Enquiry and correspondence history')
    )
  })

  test('once a decision is made the task goes and no members are awaiting decision', async () => {
    saveMemberListDecision('ironwave-compliance', {
      outcome: 'accept',
      reason: ''
    })
    const { result } = await get()

    expect(result).not.toEqual(expect.stringContaining('Member list to review'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-no-tasks"')
    )
    expect(result).toEqual(
      expect.stringContaining('5 registered, 0 awaiting decision')
    )
  })

  test('an unknown scheme is a 404', async () => {
    expect((await get('nope')).statusCode).toBe(statusCodes.notFound)
  })

  test('the registrations dashboard links its member lists card here', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorRegistrations
    })
    expect(result).toEqual(
      expect.stringContaining(`href="${urlFor('ironwave-compliance')}"`)
    )
  })
})
