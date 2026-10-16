import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { schemePath } from '../memberListShared.js'
import { getMemberListDecision, resetRegistrationsStore } from '../store.js'

const SCHEME = 'ironwave-compliance'
const urlFor = (pathKey) => schemePath(paths[pathKey], SCHEME)

const url = urlFor('prototypeRegulatorSchemeMemberList')

describe('#prototypeRegulatorMemberListReview', () => {
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

  const get = (path = url) => server.inject({ method: 'GET', url: path })
  const post = (payload) => server.inject({ method: 'POST', url, payload })

  test('renders the H1, intro, breadcrumb and the five-member table with Design System tags', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Member list — IronWave Compliance</h1>')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance submitted its member list on 12 August 2026. Each member has already been checked against Companies House. Review the list, then accept or reject it.'
      )
    )
    const table = result
      .split('data-testid="member-list-table"')[1]
      .split('</table>')[0]
    expect(table.match(/govuk-table__row/g)).toHaveLength(6)
    for (const name of [
      'GreenLeaf Ltd',
      'Voltguard Ltd',
      'Copper & Co Ltd',
      'BrightCell Ltd',
      'Solaris Power Ltd'
    ]) {
      expect(table.replace(/&amp;/g, '&')).toEqual(
        expect.stringContaining(name)
      )
    }
    expect(table).toEqual(expect.stringContaining('Companies House check'))
    expect(table.match(/govuk-tag--green/g)).toHaveLength(5)
    expect(table.match(/govuk-tag--blue/g)).toHaveLength(5)
    expect(table).toEqual(expect.stringContaining('Large'))
    expect(table).toEqual(expect.stringContaining('Small'))
  })

  test('uses accept and reject radios with a single Continue button, not two decision buttons', async () => {
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining('data-testid="member-list-decision-accept"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="member-list-decision-reject"')
    )
    expect(result.match(/data-testid="member-list-continue"/g)).toHaveLength(1)
    expect(result).not.toEqual(expect.stringContaining('Accept member list<'))
    expect(result).toEqual(
      expect.stringContaining(
        'Rejecting it sends a notification to IronWave Compliance with your reason.'
      )
    )
    expect(result).not.toEqual(expect.stringContaining('invoice'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="member-list-confirm"')
    )
  })

  test('accepting stores the decision with registration numbers and redirects to accepted', async () => {
    const { statusCode, headers } = await post({
      decision: 'accept',
      confirm: 'yes',
      reason: ''
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      urlFor('prototypeRegulatorSchemeMemberListAccepted')
    )
    const stored = getMemberListDecision(SCHEME)
    expect(stored.outcome).toBe('accept')
    expect(stored.registrations).toHaveLength(5)
    expect(stored.registrations[0]).toEqual({
      companyName: 'GreenLeaf Ltd',
      bprn: 'BPRN-004901'
    })
    expect(stored.registrations[4].bprn).toBe('BPRN-004905')
  })

  test('rejecting with a reason stores it and redirects to rejected', async () => {
    const { headers } = await post({
      decision: 'reject',
      confirm: 'yes',
      reason: 'Copper & Co is still a member of another scheme'
    })

    expect(headers.location).toBe(
      urlFor('prototypeRegulatorSchemeMemberListRejected')
    )
    expect(getMemberListDecision(SCHEME)).toMatchObject({
      outcome: 'reject',
      reason: 'Copper & Co is still a member of another scheme',
      registrations: []
    })
  })

  test('submitting with nothing selected shows an error summary and inline errors', async () => {
    const { result, statusCode } = await post({})

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="member-list-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('href="#decision-accept"'))
    expect(result).toEqual(expect.stringContaining('href="#confirm"'))
    expect(result).toEqual(
      expect.stringContaining(
        'Select whether to accept or reject the member list'
      )
    )
    expect(getMemberListDecision(SCHEME)).toBeNull()
  })

  test('rejecting without a reason errors on the reason only; accepting needs none', async () => {
    const reject = await post({
      decision: 'reject',
      confirm: 'yes',
      reason: '  '
    })
    expect(reject.result).toEqual(expect.stringContaining('href="#reason"'))
    expect(reject.result).not.toEqual(
      expect.stringContaining('href="#confirm"')
    )
    expect(getMemberListDecision(SCHEME)).toBeNull()

    const accept = await post({ decision: 'accept', confirm: 'yes' })
    expect(accept.statusCode).toBe(statusCodes.found)
  })

  test('the confirmation is required on both paths and the typed reason is kept', async () => {
    for (const decision of ['accept', 'reject']) {
      const { result } = await post({ decision, reason: 'Some reason' })
      expect(result).toEqual(expect.stringContaining('href="#confirm"'))
      expect(result).toEqual(expect.stringContaining('Some reason'))
    }
    expect(getMemberListDecision(SCHEME)).toBeNull()
  })

  test('a reason over 1000 characters is rejected', async () => {
    const { result } = await post({
      decision: 'reject',
      confirm: 'yes',
      reason: 'a'.repeat(1001)
    })
    expect(result).toEqual(
      expect.stringContaining('Reason must be 1000 characters or fewer')
    )
  })

  test('an unknown scheme is a 404', async () => {
    const { statusCode } = await get(
      schemePath(paths.prototypeRegulatorSchemeMemberList, 'nope')
    )
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('treats an empty POST body the same as an empty form', async () => {
    const empty = await server.inject({ method: 'POST', url })
    const blank = await post({})

    expect(empty.statusCode).toBe(blank.statusCode)
    expect(empty.statusCode).toBeLessThan(statusCodes.internalServerError)
  })
})
