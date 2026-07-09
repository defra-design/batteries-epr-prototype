const MODE_CLASS = 'eubr-mode'
const STORAGE_KEY = 'ni-eubr-mode'
const TOOLTIP_ID = 'app-eubr-tooltip'
const TOGGLE_ON_LABEL = 'Turn off EUBR mode'
const TOGGLE_OFF_LABEL = 'Turn on EUBR mode'
const TOOLTIP_OFFSET = 8

const readStoredMode = (win) =>
  win.sessionStorage?.getItem(STORAGE_KEY) ?? 'off'

const writeStoredMode = (win, value) => {
  win.sessionStorage?.setItem(STORAGE_KEY, value)
}

const ensureTooltip = (doc) => {
  let tooltip = doc.getElementById(TOOLTIP_ID)
  if (!tooltip) {
    tooltip = doc.createElement('div')
    tooltip.id = TOOLTIP_ID
    tooltip.className = 'app-eubr-tooltip'
    tooltip.setAttribute('role', 'tooltip')
    tooltip.hidden = true
    doc.body.appendChild(tooltip)
  }
  return tooltip
}

const appendLine = (tooltip, className, text) => {
  if (!text) return
  const node = tooltip.ownerDocument.createElement('p')
  node.className = className
  node.textContent = text
  tooltip.appendChild(node)
}

const renderTooltip = (tooltip, annotation) => {
  const articles = annotation.getAttribute('data-eubr-articles') ?? ''
  const title = annotation.getAttribute('data-eubr-title') ?? ''
  const summary = annotation.getAttribute('data-eubr-summary') ?? ''
  const appliesFrom = annotation.getAttribute('data-eubr-applies-from') ?? ''

  tooltip.textContent = ''

  if (articles) {
    const tag = tooltip.ownerDocument.createElement('span')
    tag.className = 'app-eubr-tooltip__articles'
    tag.textContent = articles
    tooltip.appendChild(tag)
  }

  appendLine(tooltip, 'app-eubr-tooltip__title', title)
  appendLine(tooltip, 'app-eubr-tooltip__summary', summary)
  appendLine(
    tooltip,
    'app-eubr-tooltip__applies',
    appliesFrom ? `Applies from ${appliesFrom}` : ''
  )
}

const positionTooltip = (tooltip, annotation, win) => {
  const rect = annotation.getBoundingClientRect()
  tooltip.style.top = `${rect.bottom + win.scrollY + TOOLTIP_OFFSET}px`
  tooltip.style.left = `${rect.left + win.scrollX}px`
}

export const initEubrOverlay = (
  doc = globalThis.document,
  win = globalThis.window
) => {
  const toggle = doc.querySelector('[data-eubr-toggle]')
  const annotations = Array.from(doc.querySelectorAll('[data-eubr]'))

  if (!toggle && annotations.length === 0) return false

  const tooltip = ensureTooltip(doc)
  let activeAnnotation = null

  const isOn = () => doc.body.classList.contains(MODE_CLASS)

  const hide = (annotation) => {
    if (activeAnnotation !== annotation) return
    tooltip.hidden = true
    if (annotation) annotation.removeAttribute('aria-describedby')
    activeAnnotation = null
  }

  const show = (annotation) => {
    if (!isOn()) return
    activeAnnotation = annotation
    renderTooltip(tooltip, annotation)
    tooltip.hidden = false
    positionTooltip(tooltip, annotation, win)
    annotation.setAttribute('aria-describedby', TOOLTIP_ID)
  }

  const setMode = (on) => {
    doc.body.classList.toggle(MODE_CLASS, on)
    annotations.forEach((annotation) => {
      if (on) annotation.setAttribute('tabindex', '0')
      else annotation.removeAttribute('tabindex')
    })
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(on))
      toggle.textContent = on ? TOGGLE_ON_LABEL : TOGGLE_OFF_LABEL
    }
    writeStoredMode(win, on ? 'on' : 'off')
    if (!on) hide(activeAnnotation)
  }

  annotations.forEach((annotation) => {
    annotation.addEventListener('mouseenter', () => show(annotation))
    annotation.addEventListener('mouseleave', () => hide(annotation))
    annotation.addEventListener('focusin', () => show(annotation))
    annotation.addEventListener('focusout', () => hide(annotation))
  })

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide(activeAnnotation)
  })

  win.addEventListener(
    'scroll',
    () => {
      if (activeAnnotation) positionTooltip(tooltip, activeAnnotation, win)
    },
    { passive: true }
  )

  if (toggle) toggle.addEventListener('click', () => setMode(!isOn()))

  setMode(readStoredMode(win) === 'on')

  return true
}
