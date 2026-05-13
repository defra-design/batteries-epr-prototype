import { contentSecurityPolicy } from './content-security-policy.js'

describe('contentSecurityPolicy', () => {
  test('returns a baseline policy with formAction defaulting to self and the appBaseUrl', () => {
    const policy = contentSecurityPolicy.options({
      url: '/',
      contentSecurityPolicy: {}
    })

    expect(policy.defaultSrc).toEqual(['self'])
    expect(policy.formAction).toEqual(
      expect.arrayContaining(['self', expect.stringContaining('http')])
    )
    expect(policy.scriptSrc[0]).toBe('self')
  })

  test('appends extraAuthOrigins to formAction when provided', () => {
    const policy = contentSecurityPolicy.options({
      url: '/something',
      contentSecurityPolicy: {
        extraAuthOrigins: ['https://example.com']
      }
    })

    expect(policy.formAction).toEqual(
      expect.arrayContaining(['https://example.com'])
    )
  })

  test('handles requests without a contentSecurityPolicy decoration', () => {
    const policy = contentSecurityPolicy.options({})

    expect(policy.scriptSrc).toEqual(expect.arrayContaining(['self']))
    expect(policy.frameAncestors).toEqual(['none'])
  })
})
