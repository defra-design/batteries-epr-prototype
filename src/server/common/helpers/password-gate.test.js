import { passwordGate } from './password-gate.js'
import { config } from '../../../config/config.js'
import { paths } from '../../../config/paths.js'

const configValues = {
  isTest: false,
  assetPath: '/public'
}

const buildHelpers = () => {
  const redirect = vi.fn((url) => ({
    takeover: vi.fn(() => ({ takeoverRedirect: url }))
  }))
  return { continue: 'CONTINUE', redirect }
}

const buildRequest = (path, { authenticated = false } = {}) => ({
  path,
  yar: { get: vi.fn(() => authenticated) }
})

describe('passwordGate', () => {
  beforeEach(() => {
    vi.spyOn(config, 'get').mockImplementation((key) => configValues[key])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('allows all requests through in the test environment', () => {
    configValues.isTest = true
    const h = buildHelpers()

    const result = passwordGate(buildRequest('/dashboard'), h)

    expect(result).toBe(h.continue)
    expect(h.redirect).not.toHaveBeenCalled()
    configValues.isTest = false
  })

  test('allows static assets through', () => {
    const h = buildHelpers()

    expect(passwordGate(buildRequest('/public/stylesheets/app.css'), h)).toBe(
      h.continue
    )
  })

  test('allows the favicon through', () => {
    const h = buildHelpers()

    expect(passwordGate(buildRequest('/favicon.ico'), h)).toBe(h.continue)
  })

  test('allows the password page and health check through', () => {
    const h = buildHelpers()

    expect(passwordGate(buildRequest(paths.password), h)).toBe(h.continue)
    expect(passwordGate(buildRequest(paths.health), h)).toBe(h.continue)
  })

  test('allows an authenticated visitor through', () => {
    const h = buildHelpers()

    expect(
      passwordGate(buildRequest('/dashboard', { authenticated: true }), h)
    ).toBe(h.continue)
  })

  test('redirects an unauthenticated visitor to the password page with returnURL', () => {
    const h = buildHelpers()

    const result = passwordGate(buildRequest('/dashboard'), h)

    expect(h.redirect).toHaveBeenCalledWith(
      `${paths.password}?returnURL=${encodeURIComponent('/dashboard')}`
    )
    expect(result).toEqual({
      takeoverRedirect: `${paths.password}?returnURL=${encodeURIComponent('/dashboard')}`
    })
  })
})
