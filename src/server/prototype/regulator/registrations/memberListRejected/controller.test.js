import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { schemePath } from '../memberListShared.js'
import { resetRegistrationsStore, saveMemberListDecision } from '../store.js'

const SCHEME = 'ironwave-compliance'
const urlFor = (pathKey) => schemePath(paths[pathKey], SCHEME)

const url = urlFor('prototypeRegulatorSchemeMemberListRejected')

describe('#prototypeRegulatorMemberListRejected', () => {
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

  test('without a rejection it redirects to the review', async () => {
    expect((await get()).statusCode).toBe(statusCodes.found)
  })

  test('has an H1, the automatic actions and the reason the regulator entered', async () => {
    saveMemberListDecision(SCHEME, {
      outcome: 'reject',
      reason: 'Remove Copper & Co or send evidence'
    })
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Member list rejected</h1>')
    )
    expect(result).toMatch(
      /You rejected IronWave Compliance(&#39;|')s member list on/
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance has been sent a notification with your reason'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('No registration numbers were issued')
    )
    expect(result.replace(/&amp;/g, '&')).toEqual(
      expect.stringContaining('Remove Copper & Co or send evidence')
    )
    expect(result).not.toEqual(expect.stringContaining('nvoice'))
  })

  test('escapes the reason', async () => {
    saveMemberListDecision(SCHEME, { outcome: 'reject', reason: '<b>x</b>' })
    expect((await get()).result).not.toEqual(
      expect.stringContaining('<b>x</b>')
    )
  })

  test('an acceptance does not unlock it', async () => {
    saveMemberListDecision(SCHEME, { outcome: 'accept', reason: '' })
    expect((await get()).statusCode).toBe(statusCodes.found)
  })
})
