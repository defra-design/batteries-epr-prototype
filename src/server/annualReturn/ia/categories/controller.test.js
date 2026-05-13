import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#iaCategoriesController', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the chrome with start link to tonnages', async () => {
    const url = pathTo(paths.annualReturnIaCategories, {
      registrationId: 'reg-1'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-categories-loading"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-categories-content"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-categories-list"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="ia-categories-start"')
    )
    expect(result).toEqual(
      expect.stringContaining('href="/annual-return/reg-1/ia/tonnages"')
    )
  })
})
