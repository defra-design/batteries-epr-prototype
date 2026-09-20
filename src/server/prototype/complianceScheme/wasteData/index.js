import { accountHome } from './accountHome/index.js'
import { start } from './start/index.js'
import { uploadUnavailable } from './uploadUnavailable/index.js'
import { enter } from './enter/index.js'
import { check } from './check/index.js'
import { declaration } from './declaration/index.js'
import { submitted } from './submitted/index.js'

export const prototypeComplianceSchemeWasteData = {
  openRoutes: [
    ...accountHome.openRoutes,
    ...start.openRoutes,
    ...uploadUnavailable.openRoutes,
    ...enter.openRoutes,
    ...check.openRoutes,
    ...declaration.openRoutes,
    ...submitted.openRoutes
  ]
}
