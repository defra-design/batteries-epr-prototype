import { vi } from 'vitest'

import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { statusCodes } from '../constants/status-codes.js'
import { catchAll } from './errors.js'

const boomResponse = (statusCode) => ({
  isBoom: true,
  output: { statusCode },
  stack: 'stack'
})

describe('catchAll unit', () => {
  test('passes non-boom responses through with h.continue', () => {
    const h = { continue: Symbol('continue') }
    const result = catchAll({ response: {} }, h)

    expect(result).toBe(h.continue)
  })

  test.each([
    [statusCodes.notFound, 'Page not found'],
    [statusCodes.forbidden, 'Forbidden'],
    [statusCodes.unauthorized, 'Unauthorized'],
    [statusCodes.badRequest, 'Bad Request'],
    [418, 'Something went wrong']
  ])(
    'renders the generic error page for status %i with message "%s"',
    (statusCode, message) => {
      const codeMock = vi.fn().mockReturnThis()
      const viewMock = vi.fn().mockReturnValue({ code: codeMock })
      const h = { view: viewMock }

      catchAll(
        {
          response: boomResponse(statusCode),
          logger: { error: vi.fn() }
        },
        h
      )

      expect(viewMock).toHaveBeenCalledWith('error/index', {
        pageTitle: message,
        heading: statusCode,
        message
      })
      expect(codeMock).toHaveBeenCalledWith(statusCode)
    }
  )

  test('logs the error stack and renders 500 view for internal server errors', () => {
    const codeMock = vi.fn().mockReturnThis()
    const viewMock = vi.fn().mockReturnValue({ code: codeMock })
    const errorLogger = vi.fn()

    catchAll(
      {
        response: boomResponse(statusCodes.internalServerError),
        logger: { error: errorLogger }
      },
      { view: viewMock }
    )

    expect(errorLogger).toHaveBeenCalledWith('stack')
    expect(viewMock).toHaveBeenCalledWith(
      'error/500',
      expect.objectContaining({
        heading: 'Sorry, there is a problem with the service'
      })
    )
    expect(codeMock).toHaveBeenCalledWith(statusCodes.internalServerError)
  })
})

describe('catchAll integration', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()

    server.route([
      {
        method: 'GET',
        path: '/test/throw-error',
        handler: () => {
          throw new Error('something went wrong')
        }
      }
    ])
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the 500 page on internal server errors', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/test/throw-error'
    })

    expect(statusCode).toBe(statusCodes.internalServerError)
    expect(result).toEqual(expect.stringContaining('there is a problem'))
  })

  test('renders the generic error page on 404 for unmatched paths', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/this-does-not-exist'
    })

    expect(statusCode).toBe(statusCodes.notFound)
    expect(result).toEqual(expect.stringContaining('Page not found'))
  })
})
