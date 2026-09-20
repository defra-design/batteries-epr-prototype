import { signIn } from './signIn/index.js'
import { returnQueried } from './returnQueried/index.js'
import { reviewFigure } from './reviewFigure/index.js'
import { correctFigure } from './correctFigure/index.js'
import { figureResent } from './figureResent/index.js'

export const prototypeComplianceSchemeQueryResponse = {
  openRoutes: [
    ...signIn.openRoutes,
    ...returnQueried.openRoutes,
    ...reviewFigure.openRoutes,
    ...correctFigure.openRoutes,
    ...figureResent.openRoutes
  ]
}
