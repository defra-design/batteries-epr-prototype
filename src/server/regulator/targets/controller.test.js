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
      'regulator-targets-collection-portable',
      'regulator-targets-recycling-automotive',
      'regulator-targets-explanation',
      'regulator-targets-save'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
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
