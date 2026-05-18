export const TIME_TRAVEL_COOKIE = 'tt-year'

const isValidYear = (n) => Number.isInteger(n) && n >= 1970 && n <= 9999

export const getCurrentYear = (request) => {
  const cookie = request?.state?.[TIME_TRAVEL_COOKIE]
  if (cookie) {
    const n = Number(cookie)
    if (isValidYear(n)) return n
  }
  return new Date().getUTCFullYear()
}

export const getCompliancePeriod = (request) =>
  String(getCurrentYear(request))

export const getCurrentDate = (request) => {
  const now = new Date()
  const year = getCurrentYear(request)
  if (year === now.getUTCFullYear()) return now
  const shifted = new Date(now)
  shifted.setUTCFullYear(year)
  return shifted
}
