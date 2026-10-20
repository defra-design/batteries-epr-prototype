import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { resetWasteReturnsStore } from '../store.js'

const params = (siteId = 'portsmouth') => ({
  schemeId: 'ironwave-compliance',
  abtoId: 'haz-tech',
  siteId
})
const confirmUrl = (siteId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsAcceptConfirm, params(siteId))
const acceptedUrl = (siteId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsAccepted, params(siteId))
const reviewUrl = (siteId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsReview, params(siteId))

describe('#prototypeRegulatorWasteReturnsAccept', () => {
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

  test('the confirm screen warns that accepting locks the record and flags the unresolved mismatch', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: confirmUrl()
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Are you sure you want to accept this submission?'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Accepting locks this record permanently')
    )
    expect(result).toEqual(
      expect.stringContaining('45.200 tonnes — match confirmed')
    )
    expect(result).toEqual(
      expect.stringContaining('12.000 tonnes — data mismatch, not yet resolved')
    )
    expect(result).toEqual(
      expect.stringContaining('The NiCd row still does not match BENs issued')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${reviewUrl('portsmouth')}"`)
    )
  })

  test('the confirm screen has no mismatch note when every category matches', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: confirmUrl('halton-industrial-park')
    })

    expect(result).not.toEqual(
      expect.stringContaining('data-testid="accept-mismatch-note"')
    )
  })

  test('accepting locks the return, updates the rolling total and shows the outcome', async () => {
    const post = await server.inject({
      method: 'POST',
      url: confirmUrl(),
      payload: {}
    })

    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(acceptedUrl('portsmouth'))

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: acceptedUrl('portsmouth')
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'Haz Tech (Portsmouth Site) — Q3 2026 return accepted'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Haz Tech and IronWave Compliance have been notified'
      )
    )
    expect(result).toEqual(expect.stringContaining('ABTO/2026/0891'))
    expect(result).toEqual(
      expect.stringContaining('Accepted, no further action required')
    )
    expect(result).toEqual(expect.stringContaining('EA caseworker'))
    expect(result).toEqual(
      expect.stringContaining('1,204.860 tonnes (updated)')
    )

    // The review screen now shows it as accepted, with the timeline entry
    const review = await server.inject({
      method: 'GET',
      url: reviewUrl('portsmouth')
    })
    expect(review.result).toEqual(
      expect.stringContaining('has been accepted and locked')
    )
  })

  test('accepting a second return adds to the rolling total', async () => {
    await server.inject({ method: 'POST', url: confirmUrl(), payload: {} })
    await server.inject({
      method: 'POST',
      url: confirmUrl('halton-industrial-park'),
      payload: {}
    })

    const { result } = await server.inject({
      method: 'GET',
      url: acceptedUrl('halton-industrial-park')
    })

    expect(result).toEqual(
      expect.stringContaining('1,243.610 tonnes (updated)')
    )
  })

  test('a return that is not awaiting review cannot be accepted again, or have its outcome shown', async () => {
    const getConfirm = await server.inject({
      method: 'GET',
      url: confirmUrl('riverside-works')
    })
    const postConfirm = await server.inject({
      method: 'POST',
      url: confirmUrl('riverside-works'),
      payload: {}
    })
    const outcome = await server.inject({
      method: 'GET',
      url: acceptedUrl('portsmouth')
    })

    expect(getConfirm.statusCode).toBe(statusCodes.found)
    expect(getConfirm.headers.location).toBe(reviewUrl('riverside-works'))
    expect(postConfirm.statusCode).toBe(statusCodes.found)
    expect(postConfirm.headers.location).toBe(reviewUrl('riverside-works'))
    expect(outcome.statusCode).toBe(statusCodes.found)
    expect(outcome.headers.location).toBe(reviewUrl('portsmouth'))
  })
})
