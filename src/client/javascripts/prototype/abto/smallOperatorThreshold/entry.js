// Opens the account home on its Waste returns tab, the one with content.
// Runs before the Design System tabs initialise, which read the hash.
if (!globalThis.location.hash) {
  globalThis.history.replaceState(null, '', '#waste-returns')
}
