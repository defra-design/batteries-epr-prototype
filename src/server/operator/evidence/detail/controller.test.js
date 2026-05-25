import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'

describe('#operatorEvidenceDetailController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the detail page with hydrate payload', async () => {
    const url = paths.operatorEvidenceDetail.replace(
      '{evidenceId}',
      'test-id-123'
    )
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"view":"detail"'))
    expect(result).toEqual(
      expect.stringContaining('"evidenceId":"test-id-123"')
    )
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-detail-list"')
    )
  })
})
