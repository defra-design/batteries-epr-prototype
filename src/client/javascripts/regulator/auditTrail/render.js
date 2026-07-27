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

export const describeCategoryAuditEntry = (entry) => {
  const actor = `${entry.actorName} (${entry.agencyCode})`
  if (entry.action === 'added') {
    return `${actor} added the ${entry.newValue} category`
  }
  if (entry.action === 'removed') {
    return `${actor} removed the ${entry.previousValue} category`
  }
  if (entry.action === 'renamed') {
    return `${actor} renamed a category from ${entry.previousValue} to ${entry.newValue}`
  }
  return `${actor} reordered the categories`
}

const describeEntry = (entry, copy) =>
  entry.configType === 'category'
    ? describeCategoryAuditEntry(entry)
    : describeAuditEntry(entry, copy)

export const renderAuditEntries = (listEl, entries, copy) => {
  if (!listEl) return
  if (entries.length === 0) {
    listEl.innerHTML = `<li class="govuk-body" data-testid="audit-entry-empty">${escape(copy.empty)}</li>`
    return
  }
  listEl.innerHTML = entries
    .map(
      (entry) =>
        `<li class="govuk-body" data-testid="audit-entry"><strong>${escape(formatDate(entry.at))}</strong> — ${escape(describeEntry(entry, copy))}</li>`
    )
    .join('')
}

const capitalise = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const targetLabel = (entry, copy) =>
  `${capitalise(copy.categoryLabels[entry.category])} ${copy.fieldLabels[entry.field]}`

const CATEGORY_CHANGE_LABELS = {
  added: 'Added category',
  removed: 'Removed category',
  renamed: 'Renamed category',
  reordered: 'Reordered categories'
}

const formatValue = (value, copy) =>
  value === null || value === undefined ? copy.notSet : `${value}%`

const changeLabel = (entry, copy) =>
  entry.configType === 'category'
    ? CATEGORY_CHANGE_LABELS[entry.action]
    : targetLabel(entry, copy)

const changeCell = (value, entry, copy) => {
  if (entry.configType === 'category') return value ?? copy.notSet
  return formatValue(value, copy)
}

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
        `<td class="govuk-table__cell">${escape(changeLabel(entry, copy))}</td>` +
        `<td class="govuk-table__cell govuk-table__cell--numeric">${escape(changeCell(entry.previousValue, entry, copy))}</td>` +
        `<td class="govuk-table__cell govuk-table__cell--numeric">${escape(changeCell(entry.newValue, entry, copy))}</td>` +
        `<td class="govuk-table__cell">${escape(entry.actorName)} (${escape(entry.agencyCode)})</td>` +
        `</tr>`
    )
    .join('')
  return 'rendered'
}
