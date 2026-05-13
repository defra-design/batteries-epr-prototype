import { storage } from '../../../storage-adapter.js'
import { readPagePayload } from '../../../page-payload.js'
import { requireAuth } from '../../../auth-gate.js'

const showSection = (doc, id, visible) => {
  const node = doc.querySelector(`#${id}`)
  if (node) node.hidden = !visible
}

export const initCategories = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc) ?? {}
  const signInUrl = payload.signInUrl ?? '/sign-in'

  if (!requireAuth(signInUrl)) return false

  const user = storage.getCurrentUser()
  const producer = storage.getProducerByEmail(user.email)
  if (!producer) {
    loc.assign(payload.dashboardUrl ?? '/dashboard')
    return 'redirected-to-dashboard'
  }

  const battery = producer.batteryTypes ?? {}
  const items = []
  if (battery.isIndustrial) items.push('Industrial batteries')
  if (battery.isAutomotive) items.push('Automotive batteries')

  const list = doc.querySelector('[data-testid="ia-categories-list"]')
  if (list) {
    list.innerHTML = ''
    for (const text of items) {
      const li = doc.createElement('li')
      li.className = 'govuk-body'
      li.setAttribute('data-testid', 'ia-category-item')
      li.textContent = text
      list.appendChild(li)
    }
  }

  if (items.length === 0) {
    showSection(doc, 'ia-categories-no-categories', true)
    const start = doc.querySelector('[data-testid="ia-categories-start"]')
    if (start) start.hidden = true
  }

  showSection(doc, 'ia-categories-loading', false)
  showSection(doc, 'ia-categories-content', true)
  return 'rendered'
}
