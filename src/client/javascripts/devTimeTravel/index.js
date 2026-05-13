import { storage } from '../storage-adapter.js'

export const performTimeTravel = (year, loc = globalThis.location) => {
  storage.setTimeTravelToYear(year)
  loc.assign('/')
}

export const performClearTimeTravel = (loc = globalThis.location) => {
  storage.clearTimeTravel()
  loc.assign('/')
}

export const wireTimeTravelButton = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const button = doc.querySelector('[data-testid="dev-time-travel-confirm"]')
  const input = doc.querySelector('[data-testid="dev-time-travel-year"]')
  const status = doc.querySelector('[data-testid="dev-time-travel-status"]')
  const clearButton = doc.querySelector(
    '[data-testid="dev-time-travel-clear"]'
  )
  const current = doc.querySelector('[data-testid="dev-time-travel-current"]')
  if (!button || !input) return false

  if (current) {
    const currentYear = storage.getTimeTravelTargetYear()
    current.textContent = currentYear
      ? `Currently travelling to ${currentYear}.`
      : 'Currently using real time.'
  }

  button.addEventListener('click', (event) => {
    event.preventDefault()
    const year = Number(input.value)
    if (!Number.isInteger(year) || year < 1970 || year > 9999) {
      if (status) {
        status.textContent =
          'Enter a four-digit year between 1970 and 9999.'
      }
      return
    }
    performTimeTravel(year, loc)
  })

  if (clearButton) {
    clearButton.addEventListener('click', (event) => {
      event.preventDefault()
      performClearTimeTravel(loc)
    })
  }

  return true
}
