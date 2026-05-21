import { leaveSchemeReason } from './reason/index.js'
import { leaveSchemeDeclaration } from './declaration/index.js'
import { leaveSchemeConfirmation } from './confirmation/index.js'

export const leaveScheme = {
  openRoutes: [
    ...leaveSchemeReason.openRoutes,
    ...leaveSchemeDeclaration.openRoutes,
    ...leaveSchemeConfirmation.openRoutes
  ]
}
