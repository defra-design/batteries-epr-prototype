import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#leaveScheme/reason', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders all reason radios and the other-reason textarea', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.leaveSchemeReason
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-reason-joined"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-reason-threshold"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-reason-other"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-other-reason"')
    )
  })

  test('POST a non-other reason renders saveDraft payload with nextStep declaration', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.leaveSchemeReason,
      payload: { reasonForLeaving: 'joinedAnotherScheme' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"saveDraft"'))
    expect(result).toEqual(
      expect.stringContaining('"reasonForLeaving":"joinedAnotherScheme"')
    )
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.leaveSchemeDeclaration}"`)
    )
  })

  test('POST other without text re-renders with otherRequired error', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.leaveSchemeReason,
      payload: { reasonForLeaving: 'other' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('Tell us why you are'))
  })

  test('POST other with text saves the otherReason field', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.leaveSchemeReason,
      payload: {
        reasonForLeaving: 'other',
        otherReason: 'Closing UK arm of the business.'
      }
    })
    expect(result).toEqual(expect.stringContaining('"target":"saveDraft"'))
    expect(result).toEqual(
      expect.stringContaining('"otherReason":"Closing UK arm of the business."')
    )
  })

  test('POST with no reason re-renders the choice error', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.leaveSchemeReason,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="leave-scheme-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('Select a reason for leaving')
    )
  })
})
