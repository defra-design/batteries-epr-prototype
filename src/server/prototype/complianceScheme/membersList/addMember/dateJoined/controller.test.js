import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'

const pageContent =
  prototypeComplianceSchemeContent.membersList.addMember.dateJoined

describe('#prototypeMembersListAddMemberDateJoined', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the day, month and year fields', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberDateJoined
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="date-joined-day"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="date-joined-month"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="date-joined-year"')
    )
  })

  test('POST with a valid past date continues to check your answers', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeMembersListAddMemberDateJoined,
      payload: {
        'dateJoined-day': '5',
        'dateJoined-month': '3',
        'dateJoined-year': '2025'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('"dateJoinedIso":"2025-03-05"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeMembersListAddMemberCheckAnswers}"`
      )
    )
  })

  const errorCases = [
    [
      'a missing field',
      { 'dateJoined-day': '5', 'dateJoined-month': '3' },
      'required'
    ],
    [
      'a non-numeric field',
      {
        'dateJoined-day': 'ab',
        'dateJoined-month': '3',
        'dateJoined-year': '2025'
      },
      'invalid'
    ],
    [
      'an impossible date',
      {
        'dateJoined-day': '31',
        'dateJoined-month': '2',
        'dateJoined-year': '2025'
      },
      'invalid'
    ],
    [
      'a future date',
      {
        'dateJoined-day': '1',
        'dateJoined-month': '1',
        'dateJoined-year': '2099'
      },
      'future'
    ]
  ]

  for (const [label, payload, errorKey] of errorCases) {
    test(`POST with ${label} redirects back with the ${errorKey} error`, async () => {
      const post = await server.inject({
        method: 'POST',
        url: paths.prototypeMembersListAddMemberDateJoined,
        payload
      })
      expect(post.statusCode).toBe(statusCodes.found)

      const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
      const { result } = await server.inject({
        method: 'GET',
        url: paths.prototypeMembersListAddMemberDateJoined,
        headers: { cookie }
      })
      expect(result).toEqual(
        expect.stringContaining('data-testid="add-member-error-summary"')
      )
      expect(result).toEqual(
        expect.stringContaining(pageContent.error[errorKey])
      )
    })
  }

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberDateJoined
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
