import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { resetWasteReturnsStore, updateAbto } from '../store.js'

const accountUrl = (abtoId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsAbtoAccount, { abtoId })

describe('#prototypeRegulatorWasteReturnsAbtoAccount', () => {
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

  test('shows the operator’s facts, account summary and the threshold warning', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: accountUrl('halton-battery-processing')
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Halton Battery Processing Ltd')
    )
    expect(result).toEqual(expect.stringContaining('ABTO/2025/0412'))
    expect(result).toEqual(expect.stringContaining('Small ABTO'))
    expect(result).toEqual(expect.stringContaining('15.420 tonnes'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--orange"[^>]*>\s*Exceeded/)
    )
    expect(result).toEqual(expect.stringContaining('Account summary'))
    expect(result).toEqual(
      expect.stringContaining(
        'Unit 4, Foundry Lane Industrial Estate, Widnes WA8 0RY'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Approved battery treatment operator (ABTO)')
    )
    expect(result).toEqual(expect.stringContaining('14 Mar 2025'))
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance, Voltguard Batteries, Copper &amp; Co Compliance'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'This ABTO has crossed the small-operator threshold'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorWasteReturnsClassification, { abtoId: 'halton-battery-processing' })}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorWasteReturnsFlags}"`
      )
    )
  })

  test('shows no warning and a dash for threshold status when under the threshold', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: accountUrl('valpak-recycling')
    })

    expect(result).toEqual(
      expect.stringContaining('Approved battery scheme (ABS)')
    )
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="abto-account-threshold-warning"')
    )
  })

  test('shows a reclassified status once reclassified', async () => {
    updateAbto('recell-processing', {
      classification: 'large',
      reclassification: { feeNote: 'INV-1', at: '2026-10-08T16:04:00' }
    })

    const { result } = await server.inject({
      method: 'GET',
      url: accountUrl('recell-processing')
    })

    expect(result).toEqual(expect.stringContaining('Large ABTO'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green"[^>]*>\s*Reclassified/)
    )
  })

  test('returns 404 for an unknown operator', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: accountUrl('nope')
    })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
