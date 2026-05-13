import { storage } from '../../storage-adapter.js'

const findActiveSubmission = (registrationId) => {
  const submissions = storage.listSubmissionsForRegistration(registrationId)
  return submissions.find((s) => s.status !== 'Submitted') ?? null
}

export const upsertSubmission = (registrationId, savedFields) => {
  const existing = findActiveSubmission(registrationId)
  return storage.saveSubmission({
    ...(existing ?? {}),
    ...savedFields,
    registrationId
  })
}

export const readActiveSubmission = (registrationId) =>
  findActiveSubmission(registrationId)

export const submissionToFormValues = (submission) => {
  if (!submission) return { mode: 'simple' }
  const values = {
    mode: submission.useDetailedDataEntry ? 'detailed' : 'simple'
  }
  for (const line of submission.lines ?? []) {
    if (line.subCategory) {
      values[`t_${line.chemistry}_${line.subCategory}`] = line.tonnes
    } else {
      values[`t_${line.chemistry}`] = line.tonnes
    }
  }
  return values
}
