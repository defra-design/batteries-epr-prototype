import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#niDashboard', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the EUBR cards, start button and card links', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niDashboard
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-start-registration"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-card-registration-link"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-card-reporting-link"')
    )
    expect(result).toEqual(expect.stringContaining('data-eubr="reporting"'))
  })
})
