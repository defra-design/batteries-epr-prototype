import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeRegistrationCheckAnswers', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the summary skeleton with change links carrying return urls', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegistrationCheckAnswers
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const rowKey of [
      'batteryTypes',
      'tonnage',
      'organisationType',
      'organisationName',
      'organisationAddress',
      'appropriatePersonName',
      'appropriatePersonEmail',
      'appropriatePersonRole',
      'schemeMembership',
      'scheme'
    ]) {
      expect(result).toEqual(
        expect.stringContaining(`data-testid="check-answers-value-${rowKey}"`)
      )
    }
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.prototypeRegistrationTonnage}?return=${encodeURIComponent(paths.prototypeRegistrationCheckAnswers)}`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegistrationDeclaration}"`
      )
    )
    expect(result).toEqual(expect.stringContaining('"step":"checkAnswers"'))
  })
})
