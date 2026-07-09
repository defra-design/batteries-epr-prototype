import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { npwdPackagingComparison } from '../../config/npwd-packaging-comparison.js'

describe('#npwdPackagingComparisonController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the NPWD vs Packaging comparison page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.npwdPackagingComparison
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(npwdPackagingComparison.heading)
    )
    for (const area of npwdPackagingComparison.areas) {
      expect(result).toEqual(
        expect.stringContaining(`comparison-area-${area.id}`)
      )
    }
    for (const group of npwdPackagingComparison.fieldGroups) {
      expect(result).toEqual(
        expect.stringContaining(`comparison-fieldgroup-${group.id}`)
      )
    }
  })
})
