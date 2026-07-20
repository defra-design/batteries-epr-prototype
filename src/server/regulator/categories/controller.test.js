import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

describe('#regulatorCategoriesController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the categories form with a hydrate payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.regulatorCategories
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).categoriesPage
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    for (const id of [
      'regulator-categories-form',
      'regulator-categories-rows',
      'regulator-categories-add',
      'regulator-categories-save',
      'battery-categories-caveat'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"nameLabel"'))
  })

  test('GET shows the saved banner when ?saved=1', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: `${paths.regulatorCategories}?saved=1`
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-categories-saved"')
    )
  })

  test('POST echoes the submitted categories in a persist payload', async () => {
    const categories = [
      { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
      { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
    ]
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorCategories,
      payload: { categoriesJson: JSON.stringify(categories) }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('LMT batteries'))
  })

  test('POST with no body yields an empty category list', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.regulatorCategories
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"categories":[]'))
  })

  test('POST tolerates malformed and non-array payloads', async () => {
    for (const categoriesJson of ['not json', '{"not":"an array"}']) {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: paths.regulatorCategories,
        payload: { categoriesJson }
      })
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(expect.stringContaining('"categories":[]'))
    }
  })
})
