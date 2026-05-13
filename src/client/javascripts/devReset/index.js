import { storage } from '../storage-adapter.js'

export const performReset = (loc = globalThis.location) => {
  storage.resetAllData()
  storage.seedDemoData()
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
