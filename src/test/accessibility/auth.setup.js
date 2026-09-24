import { test as setup } from '@playwright/test'

const storageStatePath = './src/test/accessibility/.auth/user.json'
const password = process.env.PROTOTYPE_PASSWORD ?? 'epr'

setup('log in with the prototype password', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('password-input').fill(password)
  await page.getByTestId('password-submit').click()
  await page.waitForURL('/')

  await page.context().storageState({ path: storageStatePath })
})
