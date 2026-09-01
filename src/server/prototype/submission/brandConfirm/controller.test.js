import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionBrandConfirm', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the confirm skeleton for the client to fill', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionBrandConfirm
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="brand-confirm-list"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="brand-confirm-add"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeSubmissionData}"`)
    )
    expect(result).toEqual(expect.stringContaining('"step":"brandConfirm"'))
  })
})
