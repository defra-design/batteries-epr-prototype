import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import {
  backLinkHref,
  expectNoFigmaSampleData,
  expectTaskFlowChrome,
  pagePayloadFrom
} from '../../../../../test-utils/waste-data-page.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeWasteDataDeclaration', () => {
  let server
  let result
  beforeAll(async () => {
    server = await initialiseServer()
    ;({ result } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataDeclaration
    }))
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the declaration with the seeded submitter, not a Figma person', () => {
    expect(result).toEqual(expect.stringContaining('Declaration'))
    expect(result).toEqual(
      expect.stringContaining(
        'By submitting your Q3 2026 waste data, you confirm that:'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'the figures are correct to the best of your knowledge and belief'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Submitted by: Priya Shah (authorised signatory)')
    )
    expectNoFigmaSampleData(result)
  })

  test('renders the warning as a govukWarningText and hides no leftover bullets', () => {
    expect(result).toEqual(expect.stringContaining('govuk-warning-text'))
    expect(result).toEqual(
      expect.stringContaining('official Q3 2026 waste data')
    )
    expect(result).not.toEqual(expect.stringContaining('evidence notes'))
    expect(result.match(/<li>/g)).toHaveLength(1)
  })

  test('POST hands the submission details to the client and moves on to submitted', async () => {
    const { result: posted, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeWasteDataDeclaration
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(pagePayloadFrom(posted)).toEqual({
      step: 'declaration',
      target: 'submit',
      submission: {
        schemeName: 'IronWave Compliance',
        submittedBy: 'Priya Shah',
        receivingOperator: 'Halton Battery Processing Ltd'
      },
      nextStep: paths.prototypeWasteDataSubmitted
    })
  })

  test('the payload sends the client back to enter when nothing is stored', () => {
    expect(pagePayloadFrom(result)).toMatchObject({
      step: 'declaration',
      target: 'hydrate',
      enterUrl: paths.prototypeWasteDataEnter
    })
  })

  test('the back link goes to the check screen', () => {
    expect(backLinkHref(result)).toBe(paths.prototypeWasteDataCheck)
  })

  test('is task-flow chrome', () => {
    expectTaskFlowChrome(result)
  })
})
