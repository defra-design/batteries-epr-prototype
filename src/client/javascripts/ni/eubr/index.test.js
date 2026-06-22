// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { initEubrOverlay } from './index.js'

const TOGGLE =
  '<button data-eubr-toggle aria-pressed="false">Turn on EUBR mode</button>'
const ANN_FULL =
  '<div data-eubr="registration" data-eubr-articles="Articles 55-57" data-eubr-title="Producer registration" data-eubr-summary="Register first." data-eubr-applies-from="18 August 2025">card</div>'
const ANN_SPARSE = '<div data-eubr="bare">bare</div>'

const setup = (html) => {
  document.body.innerHTML = html
}

const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }))

const fireKey = (key) => {
  const event = new Event('keydown')
  event.key = key
  document.dispatchEvent(event)
}

const tooltip = () => document.getElementById('app-eubr-tooltip')

afterEach(() => {
  document.body.innerHTML = ''
  window.sessionStorage.clear()
})

describe('initEubrOverlay', () => {
  test('returns false when there is nothing to enhance', () => {
    setup('<p>nothing here</p>')
    expect(initEubrOverlay(document, window)).toBe(false)
  })

  test('toggles mode and shows a tooltip on hover and focus', () => {
    setup(TOGGLE + ANN_FULL + ANN_SPARSE)
    expect(initEubrOverlay(document, window)).toBe(true)

    const toggle = document.querySelector('[data-eubr-toggle]')
    const ann = document.querySelector('[data-eubr="registration"]')
    const sparse = document.querySelector('[data-eubr="bare"]')

    fire(window, 'scroll')

    fire(ann, 'mouseenter')
    expect(tooltip().hidden).toBe(true)

    toggle.click()
    expect(document.body.classList.contains('eubr-mode')).toBe(true)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(toggle.textContent).toBe('Turn off EUBR mode')
    expect(ann.getAttribute('tabindex')).toBe('0')

    fire(ann, 'mouseenter')
    expect(tooltip().hidden).toBe(false)
    expect(tooltip().textContent).toContain('Articles 55-57')
    expect(tooltip().textContent).toContain('Applies from 18 August 2025')
    expect(ann.getAttribute('aria-describedby')).toBe('app-eubr-tooltip')

    fire(window, 'scroll')

    fire(sparse, 'mouseleave')
    expect(tooltip().hidden).toBe(false)

    fire(ann, 'mouseleave')
    expect(tooltip().hidden).toBe(true)
    expect(ann.hasAttribute('aria-describedby')).toBe(false)

    fire(sparse, 'focusin')
    expect(tooltip().hidden).toBe(false)
    expect(tooltip().textContent).toBe('')
    fire(sparse, 'focusout')
    expect(tooltip().hidden).toBe(true)

    toggle.click()
    expect(document.body.classList.contains('eubr-mode')).toBe(false)
    expect(ann.hasAttribute('tabindex')).toBe(false)
  })

  test('Escape hides the active tooltip, other keys are ignored', () => {
    setup(TOGGLE + ANN_FULL)
    initEubrOverlay(document, window)
    document.querySelector('[data-eubr-toggle]').click()
    const ann = document.querySelector('[data-eubr="registration"]')

    fire(ann, 'mouseenter')
    fireKey('a')
    expect(tooltip().hidden).toBe(false)
    fireKey('Escape')
    expect(tooltip().hidden).toBe(true)
  })

  test('restores the saved mode and reuses an existing tooltip', () => {
    window.sessionStorage.setItem('ni-eubr-mode', 'on')
    setup(TOGGLE + ANN_FULL)
    initEubrOverlay(document, window)
    expect(document.body.classList.contains('eubr-mode')).toBe(true)
    expect(tooltip()).not.toBeNull()

    initEubrOverlay(document, window)
    expect(document.querySelectorAll('#app-eubr-tooltip')).toHaveLength(1)
  })

  test('works without a toggle and tolerates a missing sessionStorage', () => {
    setup(ANN_FULL)
    const win = {
      sessionStorage: undefined,
      scrollY: 0,
      addEventListener: () => {}
    }
    expect(initEubrOverlay(document, win)).toBe(true)
  })
})
