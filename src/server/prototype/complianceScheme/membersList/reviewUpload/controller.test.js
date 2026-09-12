import { createRequire } from 'node:module'

import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

describe('#prototypeMembersListReviewUpload', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the heading, intro and back link to upload-csv', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListReviewUpload
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent =
      prototypeComplianceSchemeContent.membersList.reviewUpload
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining(pageContent.intro.replace(/"/g, '&quot;'))
    )

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(`href="${paths.prototypeMembersListUploadCsv}"`)
    )
  })

  test('renders every seeded member in a real govukTable, reusing the seed data', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListReviewUpload
    })

    expect(result).toEqual(
      expect.stringContaining('data-testid="review-upload-table"')
    )
    for (const member of seedData.prototypeComplianceSchemeMembers) {
      expect(result).toEqual(
        expect.stringContaining(member.companyName.replace(/&/g, '&amp;'))
      )
    }
  })

  test('marks the pendingReview member as Needs attention with a Fix link', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListReviewUpload
    })

    const pageContent =
      prototypeComplianceSchemeContent.membersList.reviewUpload
    const pending = seedData.prototypeComplianceSchemeMembers.find(
      (m) => m.status === 'pendingReview'
    )
    const fixUrl = paths.prototypeMembersListReviewUploadFix.replace(
      '{memberId}',
      pending.id
    )

    const statusCell = result.match(
      new RegExp(
        `<span data-testid="review-upload-status-${pending.id}">([^<]*)</span>`
      )
    )[1]
    expect(statusCell.trim()).toBe(pageContent.needsAttentionStatus)

    const actionCell = result.match(
      new RegExp(
        `<span data-testid="review-upload-action-${pending.id}">([\\s\\S]*?)</span>`
      )
    )[1]
    expect(actionCell).toEqual(expect.stringContaining(`href="${fixUrl}"`))
    expect(actionCell).toEqual(expect.stringContaining(pageContent.fixLink))
  })

  test('marks active members as Valid with no fix link', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListReviewUpload
    })

    const pageContent =
      prototypeComplianceSchemeContent.membersList.reviewUpload
    const active = seedData.prototypeComplianceSchemeMembers.find(
      (m) => m.status === 'active'
    )

    const statusCell = result.match(
      new RegExp(
        `<span data-testid="review-upload-status-${active.id}">([^<]*)</span>`
      )
    )[1]
    expect(statusCell.trim()).toBe(pageContent.validStatus)

    const actionCell = result.match(
      new RegExp(
        `<span data-testid="review-upload-action-${active.id}">([^<]*)</span>`
      )
    )[1]
    expect(actionCell.trim()).toBe(pageContent.fixedAction)
  })

  test('renders the add-one-member and re-upload links', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListReviewUpload
    })

    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListAddMember}" data-testid="review-upload-add-one"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListUploadCsv}" data-testid="review-upload-reupload"`
      )
    )
  })

  test('POST submits the members list and routes to the submitted screen', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListReviewUpload,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    const payloadMatch = result.match(
      /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
    )
    const pagePayload = JSON.parse(payloadMatch[1])
    expect(pagePayload).toEqual({
      target: 'submit',
      nextStep: paths.prototypeMembersListSubmitted
    })
  })

  test('is a task-flow screen: no tabs and no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListReviewUpload
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
  })

  test('shows the header with the service name, not the pEPR header-bar nav', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListReviewUpload
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('pEPR'))
  })
})
