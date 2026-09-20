import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import {
  backLinkHref,
  expectTaskFlowChrome
} from '../../../../../test-utils/waste-data-page.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeWasteDataUploadUnavailable', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET explains the upload route is not built and links back to the choice', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataUploadUnavailable
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Uploading a CSV file is not part of this prototype'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeWasteDataStart}"`)
    )
    expect(backLinkHref(result)).toBe(paths.prototypeWasteDataStart)
    expectTaskFlowChrome(result)
  })
})
