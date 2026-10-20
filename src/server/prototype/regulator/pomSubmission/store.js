import { createRequire } from 'node:module'

const seedData = createRequire(import.meta.url)(
  '../../../../client/javascripts/storage-seed.json'
)

// Server-side counterpart to the client's storage-adapter.js: seeded once
// from storage-seed.json, then mutated in place by the Review PoM return
// decision flow so a decision persists for the lifetime of the process.
// Prototype only — resets on restart, same as every other piece of state
// in this repo; there is no database behind it.
let submissions = structuredClone(seedData.prototypeRegulatorSchemeSubmissions)

// Per-record figures behind a submission, each linked to its submission by
// submissionId. Read by the compliance scheme's query-response journey so the
// scheme sees exactly the records the regulator queried.
let memberFigures = structuredClone(seedData.prototypeRegulatorMemberFigures)

// Records the regulator has queried, each answered ("responded") or still
// "awaiting" the scheme. Used by the dashboard counts and the queried records
// screen.
let queriedRecords = structuredClone(seedData.prototypeRegulatorQueriedRecords)

export const getQueriedRecords = () => queriedRecords

// Uploads the service rejected at validation before the scheme corrected them.
// Read-only: used by the scheme home row and the failed validation screen.
export const getFailedUploads = () => seedData.prototypeRegulatorFailedUploads

// Figures the service flagged on a return (read-only prompts to look, not
// errors), and the regulator's private notes on a return.
export const getFlags = () => seedData.prototypeRegulatorFlags

let submissionNotes = structuredClone(
  seedData.prototypeRegulatorSubmissionNotes
)

export const getSubmissionNote = (schemeId, year, quarter) =>
  submissionNotes.find(
    (entry) =>
      entry.schemeId === schemeId &&
      entry.compliancePeriodYear === year &&
      entry.quarter === quarter
  )?.note ?? ''

export const saveSubmissionNote = (schemeId, year, quarter, note) => {
  const existing = submissionNotes.find(
    (entry) =>
      entry.schemeId === schemeId &&
      entry.compliancePeriodYear === year &&
      entry.quarter === quarter
  )
  if (existing) {
    existing.note = note
  } else {
    submissionNotes.push({
      id: `note-${schemeId}-${year}-${quarter}`,
      schemeId,
      compliancePeriodYear: year,
      quarter,
      note
    })
  }
}

// The producer figures on a return, with the previous quarter and the same
// quarter last year for comparison. Read-only.
export const getProducerFigures = () =>
  seedData.prototypeRegulatorProducerFigures

// Queries the regulator has drafted against producers. Nothing reaches the
// scheme until the regulator confirms "Send queries to the scheme".
let draftQueries = structuredClone(seedData.prototypeRegulatorDraftQueries)

export const getDraftQueries = () => draftQueries

export const removeDraftQuery = (id) => {
  draftQueries = draftQueries.filter((query) => query.id !== id)
}

// Turns the drafts for a return into sent queries: each becomes a queried
// record awaiting the scheme's response.
export const sendDraftQueries = (schemeId, year, quarter, queriedOn) => {
  const forReturn = (query) =>
    query.schemeId === schemeId &&
    query.compliancePeriodYear === year &&
    query.quarter === quarter
  const sending = draftQueries.filter(forReturn)
  const figures = getProducerFigures()

  for (const query of sending) {
    const figure = figures.find(
      (entry) =>
        entry.schemeId === schemeId &&
        entry.compliancePeriodYear === year &&
        entry.quarter === quarter &&
        entry.producer === query.producer
    )
    queriedRecords.push({
      id: `sent-${query.id}`,
      schemeId,
      compliancePeriodYear: year,
      quarter,
      member: query.producer,
      chemistry: figure?.chemistry,
      originalTonnes: figure?.figureTonnes,
      queriedOn,
      reason: query.text,
      status: 'awaiting',
      respondedOn: null,
      response: null,
      correctedTonnes: null
    })
  }
  draftQueries = draftQueries.filter((query) => !forReturn(query))
  return sending.length
}

export const getSubmissions = () => submissions

export const getMemberFigures = () => memberFigures

export const updateMemberFigure = (id, changes) => {
  memberFigures = memberFigures.map((figure) =>
    figure.id === id ? { ...figure, ...changes } : figure
  )
  return memberFigures.find((figure) => figure.id === id)
}

export const updateSubmission = (id, changes) => {
  submissions = submissions.map((submission) =>
    submission.id === id ? { ...submission, ...changes } : submission
  )
  return submissions.find((submission) => submission.id === id)
}

// Unlike the client-side storage-adapter, this module has no browser reset
// to hook into — it's shared server-side state, so the "Reset" dev tool
// calls this via its own POST route to clear it back to the seed.
export const resetStore = () => {
  submissions = structuredClone(seedData.prototypeRegulatorSchemeSubmissions)
  memberFigures = structuredClone(seedData.prototypeRegulatorMemberFigures)
  queriedRecords = structuredClone(seedData.prototypeRegulatorQueriedRecords)
  submissionNotes = structuredClone(seedData.prototypeRegulatorSubmissionNotes)
  draftQueries = structuredClone(seedData.prototypeRegulatorDraftQueries)
}
