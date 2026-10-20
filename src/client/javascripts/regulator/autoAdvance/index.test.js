// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { DEFAULT_DELAY_MS, scheduleAutoAdvance } from './index.js'

let win

beforeEach(() => {
  vi.useFakeTimers()
  win = {
    setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
    location: { assign: vi.fn() }
  }
  document.body.innerHTML = ''
})

afterEach(() => {
  vi.useRealTimers()
})

describe('scheduleAutoAdvance', () => {
  test('does nothing on a page without an auto-advance target', () => {
    expect(scheduleAutoAdvance(document, win)).toBe(false)
    vi.advanceTimersByTime(DEFAULT_DELAY_MS * 2)
    expect(win.location.assign).not.toHaveBeenCalled()
  })

  test('goes to the target after the default 5 seconds', () => {
    document.body.innerHTML = '<div data-auto-advance-url="/next"></div>'

    expect(scheduleAutoAdvance(document, win)).toBe(true)
    vi.advanceTimersByTime(DEFAULT_DELAY_MS - 1)
    expect(win.location.assign).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(win.location.assign).toHaveBeenCalledWith('/next')
  })

  test('honours a custom delay', () => {
    document.body.innerHTML =
      '<div data-auto-advance-url="/next" data-auto-advance-delay="1000"></div>'

    scheduleAutoAdvance(document, win)
    vi.advanceTimersByTime(1000)
    expect(win.location.assign).toHaveBeenCalledWith('/next')
  })
})
