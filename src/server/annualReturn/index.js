import { tonnages as smallTonnages } from './smallProducer/tonnages/index.js'
import { declaration as smallDeclaration } from './smallProducer/declaration/index.js'
import { confirmation as smallConfirmation } from './smallProducer/confirmation/index.js'
import { categories as iaCategories } from './ia/categories/index.js'
import { tonnages as iaTonnages } from './ia/tonnages/index.js'
import { declaration as iaDeclaration } from './ia/declaration/index.js'
import { confirmation as iaConfirmation } from './ia/confirmation/index.js'
import { schemeRepresented } from './schemeRepresented/index.js'

export const annualReturn = {
  openRoutes: [
    ...smallTonnages.openRoutes,
    ...smallDeclaration.openRoutes,
    ...smallConfirmation.openRoutes,
    ...iaCategories.openRoutes,
    ...iaTonnages.openRoutes,
    ...iaDeclaration.openRoutes,
    ...iaConfirmation.openRoutes,
    ...schemeRepresented.openRoutes
  ]
}
