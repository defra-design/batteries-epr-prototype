import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionTasks', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the tasks tab with the reconfirm task linking to the task start', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionTasks
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-task-list"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-task-link"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeSubmissionTaskStart}"`)
    )
    expect(result).toEqual(expect.stringContaining('Not started'))
  })
})
