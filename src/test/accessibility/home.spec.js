import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home page has no detectable accessibility violations', async ({
  page
}) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(results.violations).toEqual([])
})
