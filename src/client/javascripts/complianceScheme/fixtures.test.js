import {
  seededApprovedScheme,
  seededNotStartedScheme
} from './fixtures.js'

describe('compliance scheme fixtures', () => {
  test('seededApprovedScheme returns an approved scheme', () => {
    const scheme = seededApprovedScheme()
    expect(scheme).toBeDefined()
    expect(scheme.approvalStatus).toBe('approved')
    expect(scheme.approvalNumber).toBeTruthy()
  })

  test('seededNotStartedScheme returns a not-started scheme', () => {
    const scheme = seededNotStartedScheme()
    expect(scheme).toBeDefined()
    expect(scheme.approvalStatus).toBe('not-started')
  })
})
