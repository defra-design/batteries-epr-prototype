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
}
