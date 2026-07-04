import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#complianceSchemeOperators', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the pending and approved operator tables', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeOperators
    })
    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.complianceScheme({}).operatorsPage
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    for (const id of [
      'operators-pending-body',
      'operators-pending-empty',
      'operators-approved-body',
      'operators-approved-empty',
      'operators-back-link'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining('"view":"list"'))
  })
})
