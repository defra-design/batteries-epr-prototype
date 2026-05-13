import { vi } from 'vitest'
import { context } from './context.js'

describe('context', () => {
  test('returns the expected shape with assetPath, serviceName, and getAssetPath', () => {
    const ctx = context()

    expect(ctx.assetPath).toBe('/public/assets')
    expect(typeof ctx.serviceName).toBe('string')
    expect(typeof ctx.getAssetPath).toBe('function')
    expect(Array.isArray(ctx.breadcrumbs)).toBe(true)
    expect(Array.isArray(ctx.navigation)).toBe(true)
  })

  test('getAssetPath returns the manifest entry when available', () => {
    const ctx = context()
    const result = ctx.getAssetPath('application.js')

    expect(typeof result).toBe('string')
    expect(result.startsWith('/public/')).toBe(true)
  })

  test('getAssetPath falls back to the asset name when manifest entry is missing', () => {
    const ctx = context()
    expect(ctx.getAssetPath('does-not-exist.js')).toBe(
      '/public/does-not-exist.js'
    )
  })

  test('logs an error when the webpack manifest cannot be read', async () => {
    vi.resetModules()
    vi.doMock('node:fs', () => ({
      readFileSync: () => {
        throw new Error('missing')
      }
    }))

    const errorSpy = vi.fn()
    vi.doMock('../../../server/common/helpers/logging/logger.js', () => ({
      createLogger: () => ({ error: errorSpy })
    }))

    const { context: freshContext } = await import('./context.js')
    freshContext()

    expect(errorSpy).toHaveBeenCalled()
    vi.doUnmock('node:fs')
    vi.doUnmock('../../../server/common/helpers/logging/logger.js')
    vi.resetModules()
  })
})
