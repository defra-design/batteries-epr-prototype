import { runSchemeSignIn } from './index.js'

runSchemeSignIn()

globalThis.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    runSchemeSignIn()
  }
})
