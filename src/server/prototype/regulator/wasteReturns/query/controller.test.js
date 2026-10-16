import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { resetWasteReturnsStore } from '../store.js'

const params = (siteId = 'halton-industrial-park') => ({
  schemeId: 'ironwave-compliance',
  abtoId: 'haz-tech',
  siteId
})
const categoriesUrl = (siteId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsQueryCategories, params(siteId))
const detailsUrl = (siteId, search = '') =>
  `${pathTo(paths.prototypeRegulatorWasteReturnsQueryDetails, params(siteId))}${search}`
const sentUrl = (siteId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsQuerySent, params(siteId))
const reviewUrl = (siteId) =>
  pathTo(paths.prototypeRegulatorWasteReturnsReview, params(siteId))

const DETAILS_SEARCH = '?categories=leadAcid&categories=nicd'

describe('#prototypeRegulatorWasteReturnsQuery', () => {
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

  describe('categories', () => {
    test('names the site and lists the categories as checkboxes', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: categoriesUrl()
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Which categories do you want to query?')
      )
      expect(result).toEqual(
        expect.stringContaining(
          'Haz Tech, Unit 4, Halton Industrial Park – ABTO/2026/0412'
        )
      )
      expect(result).toEqual(expect.stringContaining('Lead-acid'))
      expect(result).toEqual(expect.stringContaining('NiCd'))
      expect(result).toEqual(
        expect.stringContaining('data-testid="query-category-other"')
      )
    })

    test('keeps categories already chosen when coming back from the next screen', async () => {
      const { result } = await server.inject({
        method: 'GET',
        url: `${categoriesUrl()}?categories=nicd&categories=bogus`
      })

      expect(result).toEqual(expect.stringMatching(/value="nicd"[^>]*checked/))
      expect(result).not.toEqual(
        expect.stringMatching(/value="leadAcid"[^>]*checked/)
      )
    })

    test('continuing carries the chosen categories to the details screen', async () => {
      const { headers, statusCode } = await server.inject({
        method: 'POST',
        url: categoriesUrl(),
        payload: { categories: ['leadAcid', 'nicd'] }
      })

      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(
        detailsUrl('halton-industrial-park', DETAILS_SEARCH)
      )
    })

    test('a single category chosen is accepted', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: categoriesUrl(),
        payload: { categories: 'nicd' }
      })

      expect(headers.location).toBe(
        detailsUrl('halton-industrial-park', '?categories=nicd')
      )
    })

    test('shows an error when no category is chosen', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: categoriesUrl(),
        payload: {}
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Select at least one category to query')
      )
    })

    test('a return that is not awaiting review is sent back to the review screen', async () => {
      const get = await server.inject({
        method: 'GET',
        url: categoriesUrl('riverside-works')
      })
      const post = await server.inject({
        method: 'POST',
        url: categoriesUrl('riverside-works'),
        payload: { categories: 'nicd' }
      })

      expect(get.headers.location).toBe(reviewUrl('riverside-works'))
      expect(post.headers.location).toBe(reviewUrl('riverside-works'))
    })
  })

  describe('details', () => {
    test('asks who should receive the query and for an explanation', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: detailsUrl('halton-industrial-park', DETAILS_SEARCH)
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('Who should receive this query?')
      )
      expect(result).toEqual(
        expect.stringContaining(
          'Sam Patel – appropriate person, Haz Tech (Unit 4, Halton Industrial Park)'
        )
      )
      expect(result).toEqual(
        expect.stringContaining('Lee Morgan – account user')
      )
      expect(result).toEqual(expect.stringContaining('Explain the query'))
      expect(result).toEqual(expect.stringContaining('Lead-acid and NiCd'))
    })

    test('goes back to the categories screen if none were chosen', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: detailsUrl('halton-industrial-park', '?categories=bogus')
      })

      expect(headers.location).toBe(categoriesUrl('halton-industrial-park'))
    })

    test('a return that is not awaiting review is sent back to the review screen', async () => {
      const get = await server.inject({
        method: 'GET',
        url: detailsUrl('riverside-works', DETAILS_SEARCH)
      })
      const post = await server.inject({
        method: 'POST',
        url: detailsUrl('riverside-works', DETAILS_SEARCH),
        payload: { contacts: 'sam-patel', reason: 'x' }
      })

      expect(get.headers.location).toBe(reviewUrl('riverside-works'))
      expect(post.headers.location).toBe(reviewUrl('riverside-works'))
    })

    test('shows errors, keeping what was entered, when recipients and reason are missing', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: detailsUrl('halton-industrial-park', DETAILS_SEARCH),
        payload: { reason: '   ' }
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining(
          'Select at least one contact to receive the query'
        )
      )
      expect(result).toEqual(expect.stringContaining('Explain the query'))
      expect(result).toEqual(
        expect.stringContaining('data-testid="query-details-error-summary"')
      )
    })

    test('handles a submission with no body at all', async () => {
      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: detailsUrl('halton-industrial-park', DETAILS_SEARCH)
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining(
          'Select at least one contact to receive the query'
        )
      )
    })

    test('keeps the reason when only the recipients are missing', async () => {
      const { result } = await server.inject({
        method: 'POST',
        url: detailsUrl('halton-industrial-park', DETAILS_SEARCH),
        payload: { reason: 'Please check the NiCd figure' }
      })

      expect(result).toEqual(
        expect.stringContaining('value="Please check the NiCd figure"')
      )
    })

    test('keeps a chosen contact when only the reason is missing', async () => {
      const { result } = await server.inject({
        method: 'POST',
        url: detailsUrl('halton-industrial-park', DETAILS_SEARCH),
        payload: { contacts: 'lee-morgan' }
      })

      expect(result).toEqual(
        expect.stringMatching(/value="lee-morgan"[^>]*checked/)
      )
    })

    test('sending the query marks the return as queried and shows the confirmation', async () => {
      const post = await server.inject({
        method: 'POST',
        url: detailsUrl('halton-industrial-park', DETAILS_SEARCH),
        payload: {
          contacts: ['sam-patel', 'not-a-contact'],
          reason: 'NiCd tonnage in the return does not match BENs issued.'
        }
      })

      expect(post.statusCode).toBe(statusCodes.found)
      expect(post.headers.location).toBe(sentUrl('halton-industrial-park'))

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: sentUrl('halton-industrial-park')
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(expect.stringContaining('Query sent'))
      expect(result).toEqual(
        expect.stringContaining(
          'Your query about Unit 4, Halton Industrial Park (ABTO/2026/0412) has been sent to Haz Tech.'
        )
      )
      expect(result).toEqual(
        expect.stringContaining('ABTO/2026/0412 – Lead-acid and NiCd')
      )
      expect(result).toEqual(expect.stringContaining('Haz Tech (the ABTO)'))
      expect(result).toEqual(
        expect.stringContaining(
          'NiCd tonnage in the return does not match BENs issued.'
        )
      )
      expect(result).toEqual(expect.stringContaining('10 working days'))
      expect(result).toEqual(expect.stringContaining('lead-acid and NiCd'))
      expect(result).toEqual(expect.stringContaining('Back to Haz Tech return'))
      expect(result).toEqual(
        expect.stringContaining(
          `href="${paths.prototypeRegulatorWasteReturnsHome}"`
        )
      )

      // The review screen now shows the query as sent
      const review = await server.inject({
        method: 'GET',
        url: reviewUrl('halton-industrial-park')
      })
      expect(review.result).toEqual(
        expect.stringContaining('A query has been sent to the ABTO')
      )
      expect(review.result).toEqual(
        expect.stringContaining('Query sent to ABTO by EA caseworker')
      )
    })

    test('sending with only unknown contacts goes back to the categories screen', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: detailsUrl('halton-industrial-park', DETAILS_SEARCH),
        payload: { contacts: 'not-a-contact', reason: 'Please check' }
      })

      expect(headers.location).toBe(categoriesUrl('halton-industrial-park'))
    })

    test('sending without categories goes back to the categories screen', async () => {
      const { headers } = await server.inject({
        method: 'POST',
        url: detailsUrl('halton-industrial-park'),
        payload: { contacts: 'sam-patel', reason: 'Please check' }
      })

      expect(headers.location).toBe(categoriesUrl('halton-industrial-park'))
    })
  })

  describe('sent', () => {
    test('shows the seeded query for a return that already has one', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeRegulatorWasteReturnsQuerySent, {
          schemeId: 'repic',
          abtoId: 'ecobat-treatment',
          siteId: 'nottingham'
        })
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(expect.stringContaining('2 October 2026, 3:05pm'))
    })

    test('a return with no query sent goes back to the review screen', async () => {
      const { headers } = await server.inject({
        method: 'GET',
        url: sentUrl('halton-industrial-park')
      })

      expect(headers.location).toBe(reviewUrl('halton-industrial-park'))
    })
  })
})
