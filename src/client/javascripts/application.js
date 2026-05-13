import { initAll } from 'govuk-frontend'
import { applyNavAuth } from './nav-auth.js'

document.body.className += ' js-enabled govuk-frontend-supported'

initAll()
applyNavAuth()
