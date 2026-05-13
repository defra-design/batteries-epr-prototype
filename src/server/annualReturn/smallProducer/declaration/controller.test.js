import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

const url = pathTo(paths.annualReturnSmallDeclaration, {
  registrationId: 'reg-1'
})

const valid = {
  declarationFirstName: 'Sam',
  declarationLastName: 'Smith',
  declarationPosition: 'Director',
  declarationConfirm: 'yes'
}

describe('#declaration', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the form chrome', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-form"')
    )
  })

  test('POST valid renders payload with target submission-submit + nextStep confirmation', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: valid
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"target":"submission-submit"')
    )
    expect(result).toEqual(expect.stringContaining('"declaration"'))
    expect(result).toEqual(expect.stringContaining('"status":"Submitted"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"nextStep":"/annual-return/reg-1/small-producer/confirmation"'
      )
    )
  })

  test('POST without confirm redirects', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url,
      payload: { ...valid, declarationConfirm: '' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })

  test('GET after a failed POST renders flash error summary', async () => {
    const post = await server.inject({
      method: 'POST',
      url,
      payload: {}
    })
    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="annual-return-error-summary"')
    )
  })
})
