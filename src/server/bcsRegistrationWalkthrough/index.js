import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { paths } from '../../config/paths.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const bcsRegistrationWalkthrough = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.bcsRegistrationWalkthrough,
      options: { plugins: { blankie: false } },
      handler: {
        file: { path: path.join(dirname, 'index.html'), confine: false }
      }
    },
    {
      method: 'GET',
      path: `${paths.bcsRegistrationWalkthrough}/images/{image*}`,
      handler: {
        directory: { path: path.join(dirname, 'images') }
      }
    }
  ]
}
