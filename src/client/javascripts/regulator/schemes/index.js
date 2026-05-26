import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { runRegulatorSchemeList } from './list/index.js'
import { runRegulatorSchemeDetail } from './detail/index.js'
import { runRegulatorSchemeWithdraw } from './withdraw/index.js'

export const runRegulatorSchemesPage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)

  storage.seedDemoData()
  const agency = storage.currentAgency()
  if (!agency) {
    loc.assign('/regulator/sign-in')
    return 'redirected-to-sign-in'
  }

  if (payload.view === 'list') {
    return runRegulatorSchemeList(doc, loc)
  }

  if (payload.view === 'withdraw') {
    return runRegulatorSchemeWithdraw(doc, loc)
  }

  return runRegulatorSchemeDetail(doc, loc)
}
