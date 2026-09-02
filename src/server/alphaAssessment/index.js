import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { paths } from '../../config/paths.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const alphaAssessment = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.alphaAssessment,
      handler: (request, h) => h.redirect(`${paths.alphaAssessment}/index.html`)
    },
    {
      method: 'GET',
      path: `${paths.alphaAssessment}/{page*}`,
      options: { plugins: { blankie: false } },
      handler: {
        directory: { path: path.join(dirname, 'pages') }
      }
    }
  ]
}
