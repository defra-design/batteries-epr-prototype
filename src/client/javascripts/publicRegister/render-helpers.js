const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export const escape = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

export const formatBatteryTypes = (batteryTypes = {}) => {
  const labels = []
  if (batteryTypes.isPortable) labels.push('Portable')
  if (batteryTypes.isIndustrial) labels.push('Industrial')
  if (batteryTypes.isAutomotive) labels.push('Automotive')
  return labels.length ? labels.join(', ') : 'None declared'
}

export const formatAddress = (address) => {
  if (!address) return ''
  const parts = [
    address.line1,
    address.line2,
    address.line3,
    address.line4,
    address.town,
    address.postcode
  ].filter(Boolean)
  return parts.join(', ')
}
