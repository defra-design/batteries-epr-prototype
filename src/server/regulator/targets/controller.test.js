import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#regulatorTargetsController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the targets form with hydrate target', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.regulatorTargets
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).targetsPage
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining(pageContent.explanationSummary)
    )
    for (const id of [
      'regulator-targets-form',
      'regulator-targets-collection-fields',
      'regulator-targets-recycling-fields',
      'regulator-targets-explanation',
      'regulator-targets-save',
      'battery-categories-caveat'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
  })

  test('GET without the saved flag does not render the success banner', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.regulatorTargets
    })

    expect(result).not.toEqual(
      expect.stringContaining('data-testid="regulator-targets-saved"')
    )
  })

  test('GET with saved=1 renders the success banner', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: `${paths.regulatorTargets}?saved=1`
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).targetsPage
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-targets-saved"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.savedMessage))
  })

  test('POST renders with persist target and the submitted values', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorTargets,
      payload: {
        targetYears: '2026,2027,2028,2029,2030',
        collectionPortable2026: '50',
        collectionIndustrial2026: '100',
        collectionAutomotive2026: '100',
        recyclingPortable2026: '60',
        recyclingIndustrial2026: '50',
        recyclingAutomotive2026: '50'
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining('"collection":{"portable":{"2026":"50"')
    )
    expect(result).toEqual(
      expect.stringContaining('"recycling":{"portable":{"2026":"60"')
    )
  })

  test('POST reads the declared category-id list, including an added category', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorTargets,
      payload: {
        targetYears: '2026',
        categoryIds: 'portable,lmt',
        collectionPortable2026: '45',
        collectionLmt2026: '30',
        recyclingPortable2026: '45',
        recyclingLmt2026: '20'
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        '"collection":{"portable":{"2026":"45"},"lmt":{"2026":"30"}}'
      )
    )
  })

  test('POST defaults missing fields to empty strings', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorTargets,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining('"collection":{"portable":{"')
    )
  })
})
