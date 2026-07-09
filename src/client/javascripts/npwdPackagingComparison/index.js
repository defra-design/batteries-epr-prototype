const FILTER_NAME = 'classification-filter'

export const applyFilter = (doc, value) => {
  const sections = doc.querySelectorAll('[data-comparison-section]')
  for (const section of sections) {
    const rows = section.querySelectorAll('tr[data-classification]')
    let visibleCount = 0
    for (const row of rows) {
      const show = value === 'all' || row.dataset.classification === value
      row.hidden = !show
      if (show) visibleCount += 1
    }
    section.hidden = visibleCount === 0
  }
}

const selectedValue = (doc) => {
  const checked = doc.querySelector(`input[name="${FILTER_NAME}"]:checked`)
  return checked ? checked.value : 'all'
}

export const runComparisonFilter = (doc = globalThis.document) => {
  const container = doc.querySelector('[data-comparison-filter]')
  if (!container) return
  container.hidden = false
  const radios = doc.querySelectorAll(`input[name="${FILTER_NAME}"]`)
  for (const radio of radios) {
    radio.addEventListener('change', () => applyFilter(doc, selectedValue(doc)))
  }
  applyFilter(doc, selectedValue(doc))
}
