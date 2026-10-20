// Moves on to the next screen after a delay. The page also carries a meta
// refresh and a visible Continue link, so it still works without JavaScript.
export const DEFAULT_DELAY_MS = 5000

export const scheduleAutoAdvance = (
  doc = globalThis.document,
  win = globalThis.window
) => {
  const element = doc.querySelector('[data-auto-advance-url]')
  if (!element) {
    return false
  }

  const url = element.getAttribute('data-auto-advance-url')
  const delay =
    Number(element.getAttribute('data-auto-advance-delay')) || DEFAULT_DELAY_MS
  win.setTimeout(() => win.location.assign(url), delay)
  return true
}
