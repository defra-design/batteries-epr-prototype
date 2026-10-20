import { seedAbtos, seedSubmissions } from './data.js'

// In-memory state for the waste returns journey: seeded once from data.js,
// then mutated in place by accept, query and reclassify decisions so they
// persist for the lifetime of the process. Prototype only — resets on
// restart, or via the "Reset data" link (see devReset/controller.js).
let abtos = seedAbtos()
let submissions = seedSubmissions()

export const getAbtos = () => abtos

export const getSubmissions = () => submissions

export const updateAbto = (id, changes) => {
  abtos = abtos.map((abto) => (abto.id === id ? { ...abto, ...changes } : abto))
  return abtos.find((abto) => abto.id === id)
}

export const updateSubmission = (id, changes) => {
  submissions = submissions.map((submission) =>
    submission.id === id ? { ...submission, ...changes } : submission
  )
  return submissions.find((submission) => submission.id === id)
}

export const resetWasteReturnsStore = () => {
  abtos = seedAbtos()
  submissions = seedSubmissions()
}
