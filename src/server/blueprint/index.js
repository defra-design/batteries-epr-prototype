import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const blueprint = {
  openRoutes: [
    {
      method: 'GET',
      path: '/blueprint',
      options: { plugins: { blankie: false } },
      handler: {
        file: { path: path.join(dirname, 'index.html'), confine: false }
      }
    }
  ]
}
