import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../config/paths.js'

describe('#publicRegisterSearchController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the search page chrome', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.publicRegisterSearch
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="public-register-search-input"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="public-register-bprn-input"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="public-register-postcode-input"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="register-results"')
    )
    expect(result).toEqual(
      expect.stringContaining(`action="${paths.publicRegisterSearch}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"detailUrlTemplate":"${paths.publicRegisterDetail}"`
      )
    )
  })
})

describe('#publicRegisterDetailController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the detail page with the BPRN in page-payload + back link', async () => {
    const url = pathTo(paths.publicRegisterDetail, {
      bprn: 'BPRN-EA-2026-000001'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"bprn":"BPRN-EA-2026-000001"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="back-to-search"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.publicRegisterSearch}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="producer-detail"')
    )
  })
})
