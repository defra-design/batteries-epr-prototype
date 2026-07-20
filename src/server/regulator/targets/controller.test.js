import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

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
        collectionPortable: '50',
        collectionIndustrial: '100',
        collectionAutomotive: '100',
        recyclingPortable: '60',
        recyclingIndustrial: '50',
        recyclingAutomotive: '50'
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(
      expect.stringContaining('"collection":{"portable":"50"')
    )
    expect(result).toEqual(
      expect.stringContaining('"recycling":{"portable":"60"')
    )
  })

  test('POST reads the declared category-id list, including an added category', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorTargets,
      payload: {
        categoryIds: 'portable,lmt',
        collectionPortable: '45',
        collectionLmt: '30',
        recyclingPortable: '45',
        recyclingLmt: '20'
      }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"collection":{"portable":"45","lmt":"30"}')
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
      expect.stringContaining('"collection":{"portable":"","industrial":""')
    )
  })
})
