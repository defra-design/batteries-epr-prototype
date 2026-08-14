import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#playgroundController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the playground landing page with journey cards', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.playground
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.playground({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining('data-testid="playground-prototype-banner"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="playground-journey-producer-cta"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.signIn}"`))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="playground-journey-compliance-scheme-cta"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.complianceSchemeSignIn}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="playground-journey-operator-cta"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.operatorSignIn}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="playground-journey-regulator-cta"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.regulatorSignIn}"`)
    )
  })
})
