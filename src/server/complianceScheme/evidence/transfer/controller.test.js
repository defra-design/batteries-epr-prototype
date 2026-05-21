import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'

const transferUrl = (id) =>
  paths.complianceSchemeEvidenceTransfer.replace('{evidenceId}', id)

describe('#evidenceTransferController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the form shell with hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: transferUrl('e-1')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"view":"transfer"'))
    expect(result).toEqual(expect.stringContaining('"evidenceId":"e-1"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-transfer-candidates"')
    )
  })

  test('POST valid emits persist payload with counterpartySchemeId', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: transferUrl('e-1'),
      payload: 'counterpartySchemeId=22222222-0001-4000-a000-000000000002',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"counterpartySchemeId":"22222222-0001-4000-a000-000000000002"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`"next":"${paths.complianceSchemeEvidence}"`)
    )
  })

  test('POST missing counterparty redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: transferUrl('e-1'),
      payload: 'counterpartySchemeId=',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
