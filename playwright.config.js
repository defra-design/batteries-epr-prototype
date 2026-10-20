import { defineConfig, devices } from '@playwright/test'

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  'https://batteries-epr-prototype-d620a1dd9fba.herokuapp.com'

const storageStatePath = './src/test/accessibility/.auth/user.json'

export default defineConfig({
  testDir: './src/test/accessibility',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: storageStatePath
      },
      dependencies: ['setup']
    }
  ]
})
