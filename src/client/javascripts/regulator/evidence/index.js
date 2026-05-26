import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { runRegulatorEvidenceList } from './list/index.js'
import { runRegulatorEvidenceDetail } from './detail/index.js'

export const runRegulatorEvidencePage = (
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
    return runRegulatorEvidenceList(doc, loc)
  }

  return runRegulatorEvidenceDetail(doc, loc)
}
