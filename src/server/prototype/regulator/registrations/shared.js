import { regulatorPageModel } from '../layout.js'

// `layout` and `serviceName`/`serviceUrl`/`navigation` feed layouts/regulator.njk
export const basePageModel = (pageContent, options = {}) =>
  regulatorPageModel(pageContent, options)
