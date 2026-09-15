import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'

describe('#prototypeMembersListAddMemberCheckAnswers', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the summary skeleton with change links carrying return urls, and no BPRN row', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCheckAnswers
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const rowKey of [
      'organisationType',
      'organisationName',
      'organisationAddress',
      'legalNoticesAddress',
      'appropriatePersonName',
      'appropriatePersonEmail',
      'batteryTypes',
      'tonnage',
      'dateJoined'
    ]) {
      expect(result).toEqual(
        expect.stringContaining(`data-testid="check-answers-value-${rowKey}"`)
      )
    }
    expect(result).not.toEqual(expect.stringContaining('BPRN'))

    expect(result).toEqual(
      expect.stringContaining(
        `${paths.prototypeMembersListAddMemberTonnage}?return=${encodeURIComponent(paths.prototypeMembersListAddMemberCheckAnswers)}`
      )
    )
    expect(result).toEqual(expect.stringContaining('"step":"checkAnswers"'))
  })

  test('the organisation name/address Change links start as "#", set client-side', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCheckAnswers
    })

    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="check-answers-change-organisationName"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'href="#" data-testid="check-answers-change-organisationAddress"'
      )
    )
  })

  test('the Continue button is dead for now, since the declaration screen is not built', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCheckAnswers
    })

    const button = result.match(
      /<a[^>]*data-testid="check-answers-continue"[^>]*>/
    )[0]
    expect(button).toEqual(expect.stringContaining('href="#"'))
  })

  test('the back link returns to date joined', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCheckAnswers
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeMembersListAddMemberDateJoined}"`
      )
    )
  })

  test('is a task-flow screen with no breadcrumbs, tabs or masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeMembersListAddMemberCheckAnswers
    })

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })
})
