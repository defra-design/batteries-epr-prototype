const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const formatDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const describeAuditEntry = (entry, copy) => {
  const change = `${copy.categoryLabels[entry.category]} ${copy.fieldLabels[entry.field]}`
  const actor = `${entry.actorName} (${entry.agencyCode})`
  if (entry.previousValue === null || entry.previousValue === undefined) {
    return `${actor} set the ${change} target to ${entry.newValue}%`
  }
  return `${actor} changed the ${change} target from ${entry.previousValue}% to ${entry.newValue}%`
}

export const renderAuditEntries = (listEl, entries, copy) => {
  if (!listEl) return
  if (entries.length === 0) {
    listEl.innerHTML = `<li class="govuk-body" data-testid="audit-entry-empty">${escape(copy.empty)}</li>`
    return
  }
  listEl.innerHTML = entries
    .map(
      (entry) =>
        `<li class="govuk-body" data-testid="audit-entry"><strong>${escape(formatDate(entry.at))}</strong> — ${escape(describeAuditEntry(entry, copy))}</li>`
    )
    .join('')
}

const capitalise = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const targetLabel = (entry, copy) =>
  `${capitalise(copy.categoryLabels[entry.category])} ${copy.fieldLabels[entry.field]}`

const formatValue = (value, copy) =>
  value === null || value === undefined ? copy.notSet : `${value}%`

export const renderAuditTable = (tbodyEl, emptyEl, entries, copy) => {
  if (entries.length === 0) {
    tbodyEl.innerHTML = ''
    emptyEl.hidden = false
    return 'rendered-empty'
  }
  emptyEl.hidden = true
  tbodyEl.innerHTML = entries
    .map(
      (entry) =>
        `<tr class="govuk-table__row" data-testid="audit-entry">` +
        `<td class="govuk-table__cell">${escape(formatDate(entry.at))}</td>` +
        `<td class="govuk-table__cell">${escape(targetLabel(entry, copy))}</td>` +
        `<td class="govuk-table__cell govuk-table__cell--numeric">${escape(formatValue(entry.previousValue, copy))}</td>` +
        `<td class="govuk-table__cell govuk-table__cell--numeric">${escape(formatValue(entry.newValue, copy))}</td>` +
        `<td class="govuk-table__cell">${escape(entry.actorName)} (${escape(entry.agencyCode)})</td>` +
        `</tr>`
    )
    .join('')
  return 'rendered'
}
