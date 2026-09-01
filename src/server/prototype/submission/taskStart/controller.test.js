import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionTaskStart', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the reconfirm task start with the £30 fee and chemistry list', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionTaskStart
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Reconfirm your details and submit your battery data'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('pay the annual submission fee of £30')
    )
    expect(result).toEqual(expect.stringContaining('nickel-cadmium'))
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeSubmissionBatteryCategory}"`
      )
    )
  })
})
