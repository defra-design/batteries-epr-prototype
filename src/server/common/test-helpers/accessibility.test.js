import { load } from 'cheerio'

import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'

const auditPage = (html) => {
  const $ = load(html)

  const h1Count = $('h1').length
  const imgsMissingAlt = $('img')
    .filter((_, el) => !$(el).attr('alt') && $(el).attr('alt') !== '')
    .toArray()
  const nestedAnchors = $('a a').toArray()
  const inputsMissingLabels = $(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), select, textarea'
  )
    .filter((_, el) => {
      const id = $(el).attr('id')
      if (!id) return true
      return $(`label[for="${id}"]`).length === 0
    })
    .toArray()

  const errorSummaryLinks = $('.govuk-error-summary a').toArray()
  const brokenErrorLinks = errorSummaryLinks.filter((el) => {
    const href = $(el).attr('href')
    if (!href || !href.startsWith('#')) return false
    const id = href.slice(1)
    return $(`#${id}`).length === 0
  })

  return {
    h1Count,
    imgsMissingAlt: imgsMissingAlt.length,
    nestedAnchors: nestedAnchors.length,
    inputsMissingLabels: inputsMissingLabels.length,
    brokenErrorLinks: brokenErrorLinks.length
  }
}

const assertAccessible = (html) => {
  const audit = auditPage(html)
  expect(audit.h1Count).toBe(1)
  expect(audit.imgsMissingAlt).toBe(0)
  expect(audit.nestedAnchors).toBe(0)
  expect(audit.inputsMissingLabels).toBe(0)
  expect(audit.brokenErrorLinks).toBe(0)
}

describe('Accessibility audit across all primary GET routes', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const staticRoutes = [
    paths.home,
    paths.about,
    paths.cookies,
    paths.terms,
    paths.privacyNotice,
    paths.accessibility,
    paths.signIn,
    paths.signedOut,
    paths.publicRegisterSearch,
    paths.dashboard,
    paths.account,
    paths.onboardingCompanyDetails,
    paths.onboardingContactDetails,
    paths.onboardingServiceOfNotice,
    paths.onboardingBatteryTypes,
    paths.onboardingBrandNames,
    paths.onboardingProducerRoute,
    paths.onboardingDeclaration,
    paths.onboardingConfirmation,
    paths.serviceCharge,
    paths.paymentDetails
  ]

  for (const route of staticRoutes) {
    test(`${route} passes the basic accessibility audit`, async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: route
      })
      expect(statusCode).toBe(200)
      assertAccessible(result)
    })
  }

  test('public register detail (placeholder bprn) passes the audit', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/register/BPRN-EA-2026-000001'
    })
    expect(statusCode).toBe(200)
    assertAccessible(result)
  })

  test('annual return small-producer tonnages passes the audit', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/annual-return/reg-1/small-producer/tonnages'
    })
    expect(statusCode).toBe(200)
    assertAccessible(result)
  })

  test('annual return I/A categories passes the audit', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/annual-return/reg-1/ia/categories'
    })
    expect(statusCode).toBe(200)
    assertAccessible(result)
  })
})
