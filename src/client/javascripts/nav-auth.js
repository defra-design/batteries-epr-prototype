import { storage } from './storage-adapter.js'

const setVisibility = (link, visible) => {
  const li = link.closest('li')
  const target = li ?? link
  if (visible) {
    target.style.display = ''
    target.removeAttribute('hidden')
  } else {
    target.style.display = 'none'
    target.setAttribute('hidden', 'hidden')
  }
}

export const applyNavAuth = (doc = globalThis.document) => {
  const user = storage.getCurrentUser()
  const signedIn = Boolean(user?.email)

  doc.querySelectorAll('[data-auth-state="signed-in"]').forEach((link) => {
    setVisibility(link, signedIn)
  })
  doc.querySelectorAll('[data-auth-state="signed-out"]').forEach((link) => {
    setVisibility(link, !signedIn)
  })

  return signedIn
}
