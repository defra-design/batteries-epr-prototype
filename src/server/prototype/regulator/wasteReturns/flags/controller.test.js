import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { resetWasteReturnsStore, updateAbto } from '../store.js'

describe('#prototypeRegulatorWasteReturnsFlags', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  beforeEach(() => {
    resetWasteReturnsStore()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('lists the ABTOs over the 15 tonne small-operator threshold with a link to review each', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorWasteReturnsFlags
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Threshold flags'))
    expect(result).toEqual(
      expect.stringContaining('ReCell Processing (Aberdeen)')
    )
    expect(result).toEqual(
      expect.stringContaining('Halton Battery Processing Ltd (Foundry Lane)')
    )
    expect(result).toEqual(expect.stringContaining('16.100 tonnes'))
    expect(result).toEqual(expect.stringContaining('15.420 tonnes'))
    expect(result).toEqual(expect.stringContaining('Small ABTO'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange"[^>]*>\s*Exceeded/)
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorWasteReturnsAbtoAccount, { abtoId: 'halton-battery-processing' })}"`
      )
    )
    // The Flags tab is the current one
    expect(result).toEqual(expect.stringContaining('aria-current="page"'))
  })

  test('names a multi-site operator without a site in brackets', async () => {
    updateAbto('haz-tech', { bensIssuedThisYear: 20 })

    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorWasteReturnsFlags
    })

    expect(result).toEqual(expect.stringContaining('>Haz Tech<'))
  })

  test('says so when no ABTO is over the threshold', async () => {
    updateAbto('halton-battery-processing', { classification: 'large' })
    updateAbto('recell-processing', { classification: 'large' })

    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorWasteReturnsFlags
    })

    expect(result).toEqual(
      expect.stringContaining('No ABTOs are over the small-operator threshold.')
    )
  })
})
