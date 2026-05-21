import { createRequire } from 'node:module'

const seedData = createRequire(import.meta.url)(
  '../../client/javascripts/storage-seed.json'
)

export const devSchemesController = {
  handler(_request, h) {
    return h
      .response({
        seedVersion: seedData.seedVersion,
        schemes: seedData.schemes
      })
      .type('application/json')
  }
}
