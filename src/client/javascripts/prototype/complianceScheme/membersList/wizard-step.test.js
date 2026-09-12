// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'

import { storage } from '../../../storage-adapter.js'
import { runPrototypeMembersListStep } from './wizard-step.js'

const setBody = (payload, formHtml = '') => {
  document.body.innerHTML = `
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
    ${formHtml}
  `
}

const fakeLocation = () => ({ assign: vi.fn() })

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
  document.body.innerHTML = ''
})

describe('runPrototypeMembersListStep', () => {
  test('does nothing without a page payload', () => {
    document.body.innerHTML = '<form></form>'
    expect(runPrototypeMembersListStep(document, fakeLocation())).toBe(
      'no-payload'
    )
  })

  test('persists saved fields and navigates to the next step', () => {
    setBody({
      step: 'howToSend',
      target: 'save',
      savedFields: { sendMethod: 'csv' },
      nextStep: '/next'
    })
    const loc = fakeLocation()

    expect(runPrototypeMembersListStep(document, loc)).toBe('navigated')
    expect(storage.getPrototypeMembersList().sendMethod).toBe('csv')
    expect(loc.assign).toHaveBeenCalledWith('/next')
  })

  test('persists saved fields without navigating when there is no next step', () => {
    setBody({
      step: 'howToSend',
      target: 'save',
      savedFields: { sendMethod: 'onlineForm' },
      nextStep: null
    })
    const loc = fakeLocation()

    expect(runPrototypeMembersListStep(document, loc)).toBe('persisted')
    expect(loc.assign).not.toHaveBeenCalled()
  })

  test('submits the members list on the submit payload', () => {
    storage.savePrototypeMembersList({ sendMethod: 'csv' })
    setBody({
      step: 'reviewUpload',
      target: 'submit',
      savedFields: null,
      nextStep: '/submitted'
    })
    const loc = fakeLocation()

    expect(runPrototypeMembersListStep(document, loc)).toBe('navigated')
    expect(storage.getPrototypeMembersList().status).toBe('submitted')
    expect(loc.assign).toHaveBeenCalledWith('/submitted')
  })

  test('hydrates the form from the stored draft on GET', () => {
    storage.savePrototypeMembersList({ sendMethod: 'csv' })
    setBody(
      { step: 'howToSend', target: 'hydrate', skipHydration: false },
      '<form><input type="radio" name="sendMethod" value="csv"></form>'
    )

    expect(runPrototypeMembersListStep(document, fakeLocation())).toBe(
      'hydrated'
    )
    expect(document.querySelector('[name="sendMethod"]').checked).toBe(true)
  })

  test('skips hydration after a validation failure', () => {
    storage.savePrototypeMembersList({ sendMethod: 'csv' })
    setBody(
      { step: 'howToSend', target: 'hydrate', skipHydration: true },
      '<form><input type="radio" name="sendMethod" value="csv"></form>'
    )

    expect(runPrototypeMembersListStep(document, fakeLocation())).toBe(
      'preserved'
    )
    expect(document.querySelector('[name="sendMethod"]').checked).toBe(false)
  })

  test('saves the first fix when the draft has no existing fixes yet', () => {
    setBody({
      step: 'reviewUpload',
      target: 'save',
      savedFields: {
        fixes: { 'member-1': { companyRegistrationNo: '11111111' } }
      },
      nextStep: '/review-upload'
    })

    runPrototypeMembersListStep(document, fakeLocation())

    expect(storage.getPrototypeMembersList().fixes).toEqual({
      'member-1': { companyRegistrationNo: '11111111' }
    })
  })

  test('merges a new fix into existing fixes rather than replacing them', () => {
    storage.savePrototypeMembersList({
      fixes: { 'member-1': { companyRegistrationNo: '11111111' } }
    })
    setBody({
      step: 'reviewUpload',
      target: 'save',
      savedFields: {
        fixes: { 'member-2': { companyRegistrationNo: '22222222' } }
      },
      nextStep: '/review-upload'
    })

    runPrototypeMembersListStep(document, fakeLocation())

    expect(storage.getPrototypeMembersList().fixes).toEqual({
      'member-1': { companyRegistrationNo: '11111111' },
      'member-2': { companyRegistrationNo: '22222222' }
    })
  })

  test('patches a fixed row on the review-upload table from the draft', () => {
    storage.savePrototypeMembersList({
      fixes: { 'member-1': { companyRegistrationNo: '99999999' } }
    })
    setBody(
      { step: 'reviewUpload', target: 'hydrate', skipHydration: false },
      `<table>
        <tr>
          <td data-testid="review-upload-status-member-1">Needs attention</td>
          <td data-testid="review-upload-action-member-1">Fix</td>
        </tr>
      </table>`
    )

    runPrototypeMembersListStep(document, fakeLocation())

    expect(
      document.querySelector('[data-testid="review-upload-status-member-1"]')
        .textContent
    ).toContain('Valid')
    expect(
      document.querySelector('[data-testid="review-upload-action-member-1"]')
        .textContent
    ).not.toBe('Fix')
  })

  test('leaves the review-upload table untouched when the draft has no fixes yet', () => {
    setBody(
      { step: 'reviewUpload', target: 'hydrate', skipHydration: false },
      `<table>
        <tr>
          <td data-testid="review-upload-status-member-1">Needs attention</td>
          <td data-testid="review-upload-action-member-1">Fix</td>
        </tr>
      </table>`
    )

    runPrototypeMembersListStep(document, fakeLocation())

    expect(
      document.querySelector('[data-testid="review-upload-status-member-1"]')
        .textContent
    ).toBe('Needs attention')
  })

  test('renders the uploaded filename on the submitted page', () => {
    storage.savePrototypeMembersList({ uploadedFileName: 'members.csv' })
    setBody(
      { step: 'submitted', target: 'hydrate', skipHydration: false },
      '<p data-testid="submitted-filename"></p>'
    )

    runPrototypeMembersListStep(document, fakeLocation())

    expect(
      document.querySelector('[data-testid="submitted-filename"]').textContent
    ).toBe('members.csv')
  })

  test('leaves the submitted filename untouched when nothing was uploaded', () => {
    setBody(
      { step: 'submitted', target: 'hydrate', skipHydration: false },
      '<p data-testid="submitted-filename">placeholder</p>'
    )

    runPrototypeMembersListStep(document, fakeLocation())

    expect(
      document.querySelector('[data-testid="submitted-filename"]').textContent
    ).toBe('placeholder')
  })
})
