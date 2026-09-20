import {
  findSubmission,
  latestSubmissionFor
} from '../../regulator/pomSubmission/shared.js'
import {
  getMemberFigures,
  getSubmissions
} from '../../regulator/pomSubmission/store.js'

// This journey has no sign-in identity of its own: it always acts as the
// scheme the regulator's PoM submission journey is fully built for.
export const QUERY_RESPONSE_SCHEME_ID = 'ironwave-compliance'

export const returnFor = (year, quarter) =>
  findSubmission(QUERY_RESPONSE_SCHEME_ID, year, quarter)

// The return the scheme should land on after signing in: the one the
// regulator has queried, otherwise the most recent one.
export const currentReturn = () =>
  getSubmissions().find(
    (submission) =>
      submission.schemeId === QUERY_RESPONSE_SCHEME_ID &&
      submission.status === 'queried'
  ) ?? latestSubmissionFor(QUERY_RESPONSE_SCHEME_ID)

// Same records, read from the same place, as the regulator's queried
// outcome screen — not a separate list.
// Every record the regulator queried on this return, whether or not the
// scheme has corrected it yet.
export const figuresFor = (submission) =>
  submission.status === 'queried'
    ? getMemberFigures().filter(
        (figure) =>
          figure.submissionId === submission.id &&
          ['queried', 'resubmitted'].includes(figure.status)
      )
    : []

export const queriedFiguresFor = (submission) =>
  submission.status === 'queried'
    ? getMemberFigures().filter(
        (figure) =>
          figure.submissionId === submission.id && figure.status === 'queried'
      )
    : []

export const queriedFigureFor = (submission, recordId) =>
  queriedFiguresFor(submission).find((figure) => figure.id === recordId) ?? null

export const resubmittedFigureFor = (submission, recordId) =>
  figuresFor(submission).find(
    (figure) => figure.id === recordId && figure.status === 'resubmitted'
  ) ?? null
