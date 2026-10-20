import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { resetWasteReturnsStore } from '../store.js'

const ABTO_ID = 'halton-battery-processing'
const classificationUrl = pathTo(
  paths.prototypeRegulatorWasteReturnsClassification,
  { abtoId: ABTO_ID }
)
const confirmUrl = pathTo(
  paths.prototypeRegulatorWasteReturnsClassificationConfirm,
  { abtoId: ABTO_ID }
)
const doneUrl = pathTo(paths.prototypeRegulatorWasteReturnsReclassified, {
  abtoId: ABTO_ID
})
const accountUrl = pathTo(paths.prototypeRegulatorWasteReturnsAbtoAccount, {
  abtoId: ABTO_ID
})

const reclassify = (server) =>
  server.inject({
    method: 'POST',
    url: confirmUrl,
    payload: { fee: 'INV-2026-HAL-0412-LRG' }
  })

describe('#prototypeRegulatorWasteReturnsReclassify', () => {
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

  describe('classification', () => {
    test('explains the threshold and offers to reclassify or keep', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: classificationUrl
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Small to large operator threshold')
      )
      expect(result).toEqual(
        expect.stringContaining('BENs issued this approval year: 15.420 tonnes')
      )
      expect(result).toEqual(
        expect.stringContaining('Small operator threshold: 15.000 tonnes')
      )
      expect(result).toEqual(
        expect.stringContaining('Amount over threshold: 0.420 tonnes')
      )
      expect(result).toEqual(
        expect.stringContaining('Reclassify as a large ABTO')
      )
      expect(result).toEqual(
        expect.stringContaining('Keep as a small ABTO for now')
      )
    })

    test('choosing to reclassify continues to the confirmation', async () => {
      const { headers, statusCode } = await server.inject({
        method: 'POST',
        url: classificationUrl,
        payload: { decision: 'reclassify' }
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(confirmUrl)
    })

    test('choosing to keep the classification returns to the flags and changes nothing', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: classificationUrl,
        payload: { decision: 'keep' }
      })
      const flags = await server.inject({
        method: 'GET',
        url: paths.prototypeRegulatorWasteReturnsFlags
      })

      expect(headers.location).toBe(paths.prototypeRegulatorWasteReturnsFlags)
      expect(flags.result).toEqual(
        expect.stringContaining('Halton Battery Processing Ltd')
      )
    })

    test('shows an error when nothing is chosen', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: classificationUrl,
        payload: {}
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Select what you want to do')
      )
    })

    test('an operator not over the threshold goes back to its account', async () => {
      const url = pathTo(paths.prototypeRegulatorWasteReturnsClassification, {
        abtoId: 'haz-tech'
      })
      const get = await server.inject({ method: 'GET', url })
      const post = await server.inject({
        method: 'POST',
        url,
        payload: { decision: 'reclassify' }
      })
      const account = pathTo(paths.prototypeRegulatorWasteReturnsAbtoAccount, {
        abtoId: 'haz-tech'
      })

      expect(get.headers.location).toBe(account)
      expect(post.headers.location).toBe(account)
    })

    test('returns 404 for an unknown operator', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeRegulatorWasteReturnsClassification, {
          abtoId: 'nope'
        })
      })

      expect(statusCode).toBe(statusCodes.notFound)
    })
  })

  describe('confirm', () => {
    test('summarises the change and asks for the fee payment reference', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: confirmUrl
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining(
          'Confirm reclassification: Halton Battery Processing Ltd'
        )
      )
      expect(result).toEqual(expect.stringContaining('Large ABTO'))
      expect(result).toEqual(
        expect.stringContaining('1 Oct 2026 (start of next quarter)')
      )
      expect(result).toEqual(
        expect.stringContaining('Fee payment reference or note')
      )
      expect(result).toEqual(expect.stringContaining(`href="${accountUrl}"`))
    })

    test('requires a fee payment reference, keeping the page', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: confirmUrl,
        payload: { fee: '  ' }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Enter a fee payment reference or note')
      )
    })

    test('handles a submission with no body at all', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: confirmUrl
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Enter a fee payment reference or note')
      )
    })

    test('an operator not over the threshold goes back to its account', async () => {
      const url = pathTo(
        paths.prototypeRegulatorWasteReturnsClassificationConfirm,
        { abtoId: 'haz-tech' }
      )
      const get = await server.inject({ method: 'GET', url })
      const post = await server.inject({
        method: 'POST',
        url,
        payload: { fee: 'x' }
      })

      expect(get.statusCode).toBe(statusCodes.found)
      expect(post.statusCode).toBe(statusCodes.found)
    })

    test('confirming reclassifies the operator, drops it from the flags and shows the outcome', async () => {
      const post = await reclassify(server)

      expect(post.statusCode).toBe(statusCodes.found)
      expect(post.headers.location).toBe(doneUrl)

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: doneUrl
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining(
          'ABTO reclassified: Halton Battery Processing Ltd'
        )
      )
      expect(result).toEqual(
        expect.stringContaining('has been updated from a small to a large ABTO')
      )
      expect(result).toEqual(expect.stringContaining('INV-2026-HAL-0412-LRG'))
      expect(result).toEqual(
        expect.stringContaining('Tom Hughes, EA caseworker')
      )
      expect(result).toEqual(
        expect.stringMatching(/govuk-tag--green"[^>]*>\s*Reclassified/)
      )
      expect(result).toEqual(
        expect.stringContaining(
          `href="${paths.prototypeRegulatorWasteReturnsFlags}"`
        )
      )
      expect(result).toEqual(
        expect.stringContaining('View Halton Battery Processing Ltd’s account')
      )

      const flags = await server.inject({
        method: 'GET',
        url: paths.prototypeRegulatorWasteReturnsFlags
      })
      expect(flags.result).not.toEqual(
        expect.stringContaining('Halton Battery Processing Ltd')
      )
    })
  })

  describe('reclassified', () => {
    test('an operator that has not been reclassified goes back to its account', async () => {
      const { headers } = await server.inject({ method: 'GET', url: doneUrl })

      expect(headers.location).toBe(accountUrl)
    })
  })
})
