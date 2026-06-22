import { categories } from './categories/index.js'
import { placedOnMarket } from './placedOnMarket/index.js'
import { collection } from './collection/index.js'
import { recyclingEfficiency } from './recyclingEfficiency/index.js'
import { declaration } from './declaration/index.js'
import { confirmation } from './confirmation/index.js'

export const niAnnualReturn = {
  openRoutes: [
    ...categories.openRoutes,
    ...placedOnMarket.openRoutes,
    ...collection.openRoutes,
    ...recyclingEfficiency.openRoutes,
    ...declaration.openRoutes,
    ...confirmation.openRoutes
  ]
}
