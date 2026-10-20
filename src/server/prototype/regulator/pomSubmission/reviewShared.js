import { format, parseISO } from 'date-fns'

const TIME_PATTERN = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i

// "12pm" or "9:30am"
const formatTime = (date) =>
  format(date, date.getMinutes() ? 'h:mmaaa' : 'haaa')

// "12pm", "9:30am" or 24-hour "14:00" → { hours, minutes }, or null.
export const parseTime = (text) => {
  const match = TIME_PATTERN.exec(text.trim())
  if (!match) {
    return null
  }
  let hours = Number(match[1])
  const minutes = Number(match[2] ?? 0)
  const meridiem = match[3]?.toLowerCase()

  if (minutes > 59) {
    return null
  }
  if (meridiem) {
    if (hours < 1 || hours > 12) {
      return null
    }
    hours = (hours % 12) + (meridiem === 'pm' ? 12 : 0)
  } else if (hours > 23) {
    return null
  }
  return { hours, minutes }
}

// Reads a "respond or resubmit by" date and time from the form. Returns the
// instant as an ISO string, or the key of the error to show.
export const readRespondBy = (payload, prefix = 'respondBy') => {
  const day = (payload[`${prefix}-day`] ?? '').trim()
  const month = (payload[`${prefix}-month`] ?? '').trim()
  const year = (payload[`${prefix}-year`] ?? '').trim()
  const time = (payload[`${prefix}Time`] ?? '').trim()

  if (!day && !month && !year && !time) {
    return { error: 'respondByRequired' }
  }
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (
    !/^\d{1,2}$/.test(day) ||
    !/^\d{1,2}$/.test(month) ||
    !/^\d{4}$/.test(year) ||
    date.getDate() !== Number(day) ||
    date.getMonth() !== Number(month) - 1
  ) {
    return { error: 'respondByDate' }
  }
  const parsed = parseTime(time)
  if (!parsed) {
    return { error: 'respondByTime' }
  }
  date.setHours(parsed.hours, parsed.minutes, 0, 0)
  return { value: format(date, "yyyy-MM-dd'T'HH:mm:ss") }
}

// "12pm, 21 August 2026"
export const formatRespondBy = (isoString) => {
  if (!isoString) {
    return null
  }
  const date = parseISO(isoString)
  return `${formatTime(date)}, ${format(date, 'd MMMM yyyy')}`
}

// Splits a stored value back into the form's fields.
export const respondByFields = (isoString, prefix = 'respondBy') => {
  if (!isoString) {
    return {}
  }
  const date = parseISO(isoString)
  return {
    [`${prefix}-day`]: String(date.getDate()),
    [`${prefix}-month`]: String(date.getMonth() + 1),
    [`${prefix}-year`]: String(date.getFullYear()),
    [`${prefix}Time`]: formatTime(date)
  }
}
