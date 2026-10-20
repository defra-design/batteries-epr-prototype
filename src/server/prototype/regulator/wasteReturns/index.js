import { signIn } from './signIn/index.js'
import { home } from './home/index.js'
import { schemeAbtos } from './schemeAbtos/index.js'
import { abtoSites } from './abtoSites/index.js'
import { review } from './review/index.js'
import { accept } from './accept/index.js'
import { query } from './query/index.js'
import { flags } from './flags/index.js'
import { abtoAccount } from './abtoAccount/index.js'
import { reclassify } from './reclassify/index.js'

export const prototypeRegulatorWasteReturns = {
  openRoutes: [
    ...signIn.openRoutes,
    ...home.openRoutes,
    ...schemeAbtos.openRoutes,
    ...abtoSites.openRoutes,
    ...review.openRoutes,
    ...accept.openRoutes,
    ...query.openRoutes,
    ...flags.openRoutes,
    ...abtoAccount.openRoutes,
    ...reclassify.openRoutes
  ]
}
