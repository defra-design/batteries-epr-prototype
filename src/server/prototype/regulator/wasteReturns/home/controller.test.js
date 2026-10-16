import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorWasteReturnsHome', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('lists every scheme, linking only those with waste returns, with the section tabs', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorWasteReturnsHome
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Waste returns'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-returns-tabs"')
    )
    expect(result).toEqual(expect.stringContaining('aria-current="page"'))
    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorWasteReturnsSchemeAbtos, { schemeId: 'ironwave-compliance' })}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-returns-scheme-repic"')
    )
    // A scheme without waste returns is plain text, not a link
    expect(result).not.toEqual(
      expect.stringContaining('waste-returns-scheme-voltguard-batteries')
    )
    expect(result).toEqual(expect.stringContaining('Voltguard Batteries'))
    expect(result).toEqual(expect.stringContaining('No waste returns'))
  })
})
