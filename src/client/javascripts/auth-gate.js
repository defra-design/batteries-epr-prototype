import { storage } from './storage-adapter.js'

export const requireAuth = (signInUrl = '/sign-in') => {
  storage.seedDemoData()
  const user = storage.getCurrentUser()
  if (!user || !user.email) {
    globalThis.location.assign(signInUrl)
    return false
  }
  return true
}
