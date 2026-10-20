import {
  formatRespondBy,
  parseTime,
  readRespondBy,
  respondByFields
} from './reviewShared.js'

describe('parseTime', () => {
  test.each([
    ['12pm', { hours: 12, minutes: 0 }],
    ['12am', { hours: 0, minutes: 0 }],
    ['9:30am', { hours: 9, minutes: 30 }],
    ['9:30 PM', { hours: 21, minutes: 30 }],
    ['14:00', { hours: 14, minutes: 0 }]
  ])('%s', (text, expected) => {
    expect(parseTime(text)).toEqual(expected)
  })

  test.each(['', 'noon', '13pm', '0pm', '25:00', '9:75am'])(
    'rejects %s',
    (text) => {
      expect(parseTime(text)).toBeNull()
    }
  )
})

describe('readRespondBy', () => {
  const valid = {
    'respondBy-day': '21',
    'respondBy-month': '8',
    'respondBy-year': '2026',
    respondByTime: '12pm'
  }

  test('reads a valid date and time', () => {
    expect(readRespondBy(valid)).toEqual({ value: '2026-08-21T12:00:00' })
  })

  test('asks for everything when empty', () => {
    expect(readRespondBy({})).toEqual({ error: 'respondByRequired' })
  })

  test('rejects impossible dates and bad times', () => {
    expect(
      readRespondBy({ ...valid, 'respondBy-day': '31', 'respondBy-month': '2' })
    ).toEqual({
      error: 'respondByDate'
    })
    expect(readRespondBy({ ...valid, 'respondBy-year': '26' })).toEqual({
      error: 'respondByDate'
    })
    expect(readRespondBy({ ...valid, respondByTime: 'soon' })).toEqual({
      error: 'respondByTime'
    })
  })

  test('supports another field prefix', () => {
    expect(
      readRespondBy(
        {
          'resubmitBy-day': '28',
          'resubmitBy-month': '8',
          'resubmitBy-year': '2026',
          resubmitByTime: '9:30am'
        },
        'resubmitBy'
      )
    ).toEqual({ value: '2026-08-28T09:30:00' })
  })
})

describe('formatRespondBy / respondByFields', () => {
  test('formats like the Figma: 12pm, 21 August 2026', () => {
    expect(formatRespondBy('2026-08-21T12:00:00')).toBe('12pm, 21 August 2026')
    expect(formatRespondBy('2026-08-21T09:30:00')).toBe(
      '9:30am, 21 August 2026'
    )
    expect(formatRespondBy(null)).toBeNull()
  })

  test('round-trips into form fields', () => {
    expect(respondByFields('2026-08-21T12:00:00')).toEqual({
      'respondBy-day': '21',
      'respondBy-month': '8',
      'respondBy-year': '2026',
      respondByTime: '12pm'
    })
    expect(respondByFields('2026-08-21T09:30:00').respondByTime).toBe('9:30am')
    expect(respondByFields(null)).toEqual({})
  })
})
