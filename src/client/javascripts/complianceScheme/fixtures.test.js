import { seededApprovedScheme } from './fixtures.js'

describe('compliance scheme fixtures', () => {
  test('seededApprovedScheme returns an approved scheme', () => {
    const scheme = seededApprovedScheme()
    expect(scheme).toBeDefined()
    expect(scheme.approvalStatus).toBe('approved')
    expect(scheme.approvalNumber).toBeTruthy()
  })
})
