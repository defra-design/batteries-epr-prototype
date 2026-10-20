import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { schemePath } from '../memberListShared.js'
import { resetRegistrationsStore, saveMemberListDecision } from '../store.js'

const SCHEME = 'ironwave-compliance'
const urlFor = (pathKey) => schemePath(paths[pathKey], SCHEME)

const url = urlFor('prototypeRegulatorSchemeMemberListAccepted')

describe('#prototypeRegulatorMemberListAccepted', () => {
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

  const get = () => server.inject({ method: 'GET', url })

  test('without an acceptance it redirects to the review', async () => {
    const { statusCode, headers } = await get()
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(urlFor('prototypeRegulatorSchemeMemberList'))
  })

  test('has an H1, the panel, the issued registration numbers and no invoice or fees', async () => {
    saveMemberListDecision(SCHEME, { outcome: 'accept', reason: '' })
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Member list — IronWave Compliance</h1>')
    )
    expect(result).toMatch(
      /You accepted this member list on \d{1,2} \w+ \d{4}\./
    )
    expect(result).toEqual(
      expect.stringContaining('5 members are now registered')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Registration numbers BPRN-004901 to BPRN-004905 issued to the 5 members'
      )
    )
    const table = result
      .split('data-testid="member-list-registered"')[1]
      .split('</table>')[0]
    expect(table.match(/BPRN-00490\d/g)).toHaveLength(5)
    expect(result).not.toEqual(expect.stringContaining('nvoice'))
    expect(result).not.toEqual(expect.stringContaining('£'))
  })

  test('links back to the scheme dashboard', async () => {
    saveMemberListDecision(SCHEME, { outcome: 'accept', reason: '' })
    const { result } = await get()
    expect(result).toEqual(
      expect.stringContaining(`href="${urlFor('prototypeRegulatorScheme')}"`)
    )
  })

  test('a rejection does not unlock it', async () => {
    saveMemberListDecision(SCHEME, { outcome: 'reject', reason: 'x' })
    expect((await get()).statusCode).toBe(statusCodes.found)
  })
})
