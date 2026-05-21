import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'

const detailUrl = (id) =>
  paths.complianceSchemeEvidenceDetail.replace('{evidenceId}', id)

describe('#evidenceDetailController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the detail shell with the evidenceId in the payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: detailUrl('e-1')
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"view":"detail"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"evidenceId":"e-1"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-detail-list"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-detail-accept"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-detail-reject"')
    )
  })

  test('POST accept emits persist payload with newStatus=accepted', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: detailUrl('e-1'),
      payload: 'action=accept',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"newStatus":"accepted"'))
    expect(result).toEqual(
      expect.stringContaining(`"next":"${paths.complianceSchemeEvidence}"`)
    )
  })

  test('POST reject emits persist payload with newStatus=cancelled', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: detailUrl('e-1'),
      payload: 'action=reject',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"newStatus":"cancelled"'))
  })

  test('POST with no action defaults to accept', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: detailUrl('e-1'),
      payload: '',
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    expect(result).toEqual(expect.stringContaining('"newStatus":"accepted"'))
  })
})
