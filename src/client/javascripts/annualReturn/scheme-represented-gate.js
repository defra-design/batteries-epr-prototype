import { storage } from '../storage-adapter.js'

export const redirectIfSchemeRoute = (registrationId, loc) => {
  if (!registrationId) return false
  const registration = storage.getRegistration(registrationId)
  if (registration?.producerRoute !== 'complianceScheme') return false
  loc.assign(`/annual-return/${registrationId}/scheme-represented`)
  return true
}
