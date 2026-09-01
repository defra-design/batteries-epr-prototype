import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionBrandAdd', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the brand name input with an add-another link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionBrandAdd
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="brand-add-input"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="brand-add-another"')
    )
  })

  test('POST with one brand saves it and continues to the confirm page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBrandAdd,
      payload: { brandNames: 'Bunny Batteries' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"brandNames":["Bunny Batteries"]')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeSubmissionBrandConfirm}"`
      )
    )
  })

  test('POST with repeated inputs saves every non-empty brand', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBrandAdd,
      payload: { brandNames: ['Bunny Batteries', '', 'Power Paws'] }
    })
    expect(result).toEqual(
      expect.stringContaining('"brandNames":["Bunny Batteries","Power Paws"]')
    )
  })

  test('POST with only empty values redirects back with an error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBrandAdd,
      payload: { brandNames: ['', '  '] }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionBrandAdd,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-submission-error-summary"'
      )
    )
  })

  test('POST without the field redirects back via the validator', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBrandAdd,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
