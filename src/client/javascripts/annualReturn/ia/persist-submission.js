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
  if (!submission) return {}
  const values = {}
  for (const line of submission.lines ?? []) {
    if (line.subCategory) continue
    values[`t_${line.category}_${line.activity}_${line.chemistry}`] =
      line.tonnes
  }
  return values
}
