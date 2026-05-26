import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

describe('#regulatorDashboardController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the dashboard shell with all tile slots', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.regulatorDashboard
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading.text))
    expect(result).toEqual(expect.stringContaining(pageContent.introParagraph))

    for (const id of [
      'regulator-dashboard',
      'tile-schemes-count',
      'tile-operators-count',
      'tile-producers-count',
      'tile-evidence-count'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
  })

  test('emits a page-payload with copy', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.regulatorDashboard
    })

    expect(result).toEqual(expect.stringContaining('id="page-payload"'))
    expect(result).toEqual(expect.stringContaining('"copy"'))
  })
})
