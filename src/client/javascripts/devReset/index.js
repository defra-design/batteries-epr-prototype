import { storage } from '../storage-adapter.js'
import { storage as niStorage } from '../ni/storage.js'

export const performReset = async (
  loc = globalThis.location,
  fetchFn = globalThis.fetch
) => {
  storage.resetAllData()
  niStorage.resetAllData()
  storage.seedDemoData()
  // Server-side state (e.g. the regulator's in-memory decisions) has no
  // browser storage to clear above, so ask the server to reset its own
  // copy too. Best-effort — a failed request shouldn't block the redirect.
  await fetchFn('/dev/reset', { method: 'POST' }).catch(() => {})
  loc.assign('/')
}

export const wireResetButton = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const button = doc.querySelector('[data-testid="dev-reset-confirm"]')
  if (!button) return false
  button.addEventListener('click', (event) => {
    event.preventDefault()
    performReset(loc)
  })
  return true
}
