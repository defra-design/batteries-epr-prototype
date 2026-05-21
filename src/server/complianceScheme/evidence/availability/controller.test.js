import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'

describe('#evidenceAvailabilityController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the form with hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeEvidenceAvailability
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"view":"availability"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-availability-form"')
    )
  })

  test('POST emits persist payload with next=list', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.complianceSchemeEvidenceAvailability
    })
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining(`"next":"${paths.complianceSchemeEvidence}"`)
    )
  })
})
