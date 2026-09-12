import { createRequire } from 'node:module'

import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../../client/javascripts/storage-seed.json'
)

const pending = seedData.prototypeComplianceSchemeMembers.find(
  (m) => m.status === 'pendingReview'
)

const urlFor = (memberId) =>
  paths.prototypeMembersListReviewUploadFix.replace('{memberId}', memberId)

describe('#prototypeMembersListReviewUploadFix', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the caption with the member name and a blank field', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(pending.id)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        `Fixing: ${pending.companyName.replace(/&/g, '&amp;')}`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="fix-company-registration-no"')
    )

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListReviewUpload}"`
      )
    )
  })

  test('POST with an empty value renders an error summary and inline error', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(pending.id),
      payload: { companyRegistrationNo: '' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = prototypeComplianceSchemeContent.membersList.fix
    expect(result).toEqual(
      expect.stringContaining('data-testid="fix-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.error.message.replace(/'/g, '&#39;'))
    )
    expect(result).toEqual(
      expect.stringContaining('href="#companyRegistrationNo"')
    )
  })

  test('POST with a value persists the fix keyed by member id and routes back to review-upload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(pending.id),
      payload: { companyRegistrationNo: '99999999' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'save',
      savedFields: {
        fixes: { [pending.id]: { companyRegistrationNo: '99999999' } }
      },
      nextStep: paths.prototypeMembersListReviewUpload
    })
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(pending.id)
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(pending.id)
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
