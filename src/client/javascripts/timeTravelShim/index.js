const TARGET_YEAR_KEY = 'npwd-batteries:time-travel-target-year'

export const installShim = (
  storage = globalThis.localStorage,
  globalScope = globalThis
) => {
  const raw = storage.getItem(TARGET_YEAR_KEY)
  if (raw === null || raw === '') return null
  const targetYear = Number(raw)
  if (!Number.isInteger(targetYear)) return null

  const RealDate = globalScope.Date
  const realNow = RealDate.now.bind(RealDate)
  const realCurrentYear = new RealDate(realNow()).getUTCFullYear()
  if (targetYear === realCurrentYear) return null

  const target = new RealDate(realNow())
  target.setUTCFullYear(targetYear)
  const offset = target.getTime() - realNow()

  function PatchedDate(...args) {
    if (!new.target) {
      return new RealDate(realNow() + offset).toString()
    }
    if (args.length === 0) {
      return new RealDate(realNow() + offset)
    }
    return new RealDate(...args)
  }
  PatchedDate.prototype = RealDate.prototype
  Object.setPrototypeOf(PatchedDate, RealDate)
  PatchedDate.now = () => realNow() + offset
  PatchedDate.UTC = RealDate.UTC.bind(RealDate)
  PatchedDate.parse = RealDate.parse.bind(RealDate)

  globalScope.Date = PatchedDate
  return offset
}
