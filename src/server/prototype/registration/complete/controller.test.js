import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationComplete', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the confirmation panel skeleton for the client to fill', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationComplete
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="complete-panel-title"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="complete-bprn"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="complete-bprn-bullet"')
    )
    expect(result).toEqual(expect.stringContaining('"step":"complete"'))
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeSubmissionAccount}"`)
    )
  })
})
