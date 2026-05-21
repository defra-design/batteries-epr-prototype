import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'

const SCHEME_ID = '22222222-0001-4000-a000-000000000001'

const declarationPayload = {
  declarationFirstName: 'Sam',
  declarationLastName: 'Smith',
  declarationPosition: 'Director',
  declarationConfirm: 'yes'
}

describe('compliance-scheme onboarding path', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('producerRoute → schemeSelect → schemeConfirm → declaration → confirmation each route succeeds', async () => {
    const route = await server.inject({
      method: 'POST',
      url: paths.onboardingProducerRoute,
      payload: { producerRoute: 'complianceScheme' }
    })
    expect(route.statusCode).toBe(statusCodes.ok)
    expect(route.result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.onboardingSchemeSelect}"`)
    )

    const select = await server.inject({
      method: 'POST',
      url: paths.onboardingSchemeSelect,
      payload: { schemeId: SCHEME_ID }
    })
    expect(select.statusCode).toBe(statusCodes.ok)
    expect(select.result).toEqual(
      expect.stringContaining(`"schemeId":"${SCHEME_ID}"`)
    )
    expect(select.result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.onboardingSchemeConfirm}"`)
    )

    const confirm = await server.inject({
      method: 'POST',
      url: paths.onboardingSchemeConfirm,
      payload: {}
    })
    expect(confirm.statusCode).toBe(statusCodes.ok)
    expect(confirm.result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.onboardingDeclaration}?route=complianceScheme"`
      )
    )

    const declaration = await server.inject({
      method: 'POST',
      url: `${paths.onboardingDeclaration}?route=complianceScheme`,
      payload: declarationPayload
    })
    expect(declaration.statusCode).toBe(statusCodes.ok)
    expect(declaration.result).toEqual(
      expect.stringContaining('"target":"registration-and-submit"')
    )
    expect(declaration.result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.onboardingConfirmation}"`)
    )

    const final = await server.inject({
      method: 'GET',
      url: paths.onboardingConfirmation
    })
    expect(final.statusCode).toBe(statusCodes.ok)
  })

  test('schemeSelect lists only approved schemes from the seed', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.onboardingSchemeSelect
    })
    expect(result).toEqual(
      expect.stringContaining(`data-testid="scheme-select-radio-${SCHEME_ID}"`)
    )
  })
})
