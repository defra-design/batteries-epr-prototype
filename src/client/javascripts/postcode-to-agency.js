const NIEA_PREFIXES = ['BT']

const SEPA_PREFIXES = [
  'AB',
  'DD',
  'DG',
  'EH',
  'FK',
  'G',
  'HS',
  'IV',
  'KA',
  'KW',
  'KY',
  'ML',
  'PA',
  'PH',
  'TD',
  'ZE'
]

const NRW_PREFIXES = ['CF', 'LD', 'LL', 'NP', 'SA', 'SY']

const normalisePostcode = (postcode) =>
  String(postcode ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()

const matchPrefix = (postcode, prefixes) =>
  prefixes.some((prefix) => {
    const next = postcode.charAt(prefix.length)
    return postcode.startsWith(prefix) && (next === '' || /\d/.test(next))
  })

export const postcodeToAgency = (postcode) => {
  const normalised = normalisePostcode(postcode)
  if (matchPrefix(normalised, NIEA_PREFIXES)) return 'NIEA'
  if (matchPrefix(normalised, NRW_PREFIXES)) return 'NRW'
  if (matchPrefix(normalised, SEPA_PREFIXES)) return 'SEPA'
  return 'EA'
}
