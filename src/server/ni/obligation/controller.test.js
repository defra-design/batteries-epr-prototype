import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#niObligation', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the obligation container and EUBR annotation', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.niObligation
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ni-obligation"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-ni-obligation-results')
    )
    expect(result).toEqual(
      expect.stringContaining('data-eubr="collectionTargets"')
    )
  })
})
