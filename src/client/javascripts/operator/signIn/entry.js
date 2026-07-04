import { runOperatorSignIn } from './index.js'

runOperatorSignIn()

globalThis.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    runOperatorSignIn()
  }
})
