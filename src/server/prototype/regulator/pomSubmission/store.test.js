import { getSubmissionNote, resetStore, saveSubmissionNote } from './store.js'

describe('submission notes', () => {
  beforeEach(() => {
    resetStore()
  })

  test('a return with no note reads as an empty string', () => {
    expect(getSubmissionNote('ironwave-compliance', '2026', 'Q1')).toBe('')
  })

  test('saving creates a note for a return that had none, then updates it', () => {
    saveSubmissionNote('ironwave-compliance', '2026', 'Q1', 'First')
    expect(getSubmissionNote('ironwave-compliance', '2026', 'Q1')).toBe('First')

    saveSubmissionNote('ironwave-compliance', '2026', 'Q1', 'Second')
    expect(getSubmissionNote('ironwave-compliance', '2026', 'Q1')).toBe(
      'Second'
    )
  })
})
