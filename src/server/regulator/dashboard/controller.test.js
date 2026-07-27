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
      'tile-evidence-count',
      'regulator-configuration',
      'regulator-targets-link',
      'regulator-categories-link',
      'regulator-audit-trail-link'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining(paths.regulatorTargets))
  })

  test('groups the config links in the Configuration card with labels', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.regulatorDashboard
    })

    const pageContent = content.regulator({})
    expect(result).toEqual(
      expect.stringContaining(pageContent.configurationHeading)
    )
    expect(result).toEqual(expect.stringContaining(pageContent.targetsAction))
    expect(result).toEqual(
      expect.stringContaining(pageContent.categoriesAction)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.auditTrailAction)
    )
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
