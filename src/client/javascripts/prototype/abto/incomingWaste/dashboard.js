const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const formatReportedOn = (iso) => {
  const date = new Date(iso)
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

const buildRow = (doc, delivery, payload) => {
  const row = doc.createElement('tr')
  row.className = 'govuk-table__row'
  row.dataset.testid = `abto-dashboard-row-${delivery.id}`

  const summary = doc.createElement('td')
  summary.className = 'govuk-table__cell'
  summary.textContent = `${delivery.schemeName} — reported ${formatReportedOn(delivery.reportedOn)}, ${delivery.reportedTonnes.toFixed(3)}t, batch ${delivery.id}`

  const action = doc.createElement('td')
  action.className = 'govuk-table__cell'
  const link = doc.createElement('a')
  link.className = 'govuk-link'
  link.setAttribute(
    'href',
    payload.compareUrlTemplate.replace('{deliveryId}', delivery.id)
  )
  link.dataset.testid = `abto-dashboard-verify-${delivery.id}`
  link.textContent = payload.verifyAction
  action.append(link)

  row.append(summary, action)
  return row
}

export const renderIncomingDeliveries = (doc, deliveries, payload) => {
  const tbody = doc.querySelector('[data-testid="abto-dashboard-table"] tbody')
  if (!tbody) return

  deliveries
    .filter((delivery) => delivery.receivingOperator === payload.operatorName)
    .forEach((delivery) => tbody.append(buildRow(doc, delivery, payload)))
}
