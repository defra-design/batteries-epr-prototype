import { paths, pathTo } from './paths.js'

describe('pathTo', () => {
  test('replaces a single token', () => {
    expect(
      pathTo(paths.publicRegisterDetail, { bprn: 'BPRN-EA-2026-000001' })
    ).toBe('/register/BPRN-EA-2026-000001')
  })

  test('replaces multiple tokens', () => {
    expect(
      pathTo(paths.annualReturn, { registrationId: 'abc', step: 'tonnages' })
    ).toBe('/annual-return/abc/tonnages')
  })

  test('throws when a required param is missing', () => {
    expect(() => pathTo(paths.publicRegisterDetail, {})).toThrow(
      /Missing key bprn/
    )
  })
})
