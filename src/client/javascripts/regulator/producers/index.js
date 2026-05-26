import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { runRegulatorProducerList } from './list/index.js'
import { runRegulatorProducerDetail } from './detail/index.js'

export const runRegulatorProducersPage = (
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
    return runRegulatorProducerList(doc, loc)
  }

  return runRegulatorProducerDetail(doc, loc)
}
