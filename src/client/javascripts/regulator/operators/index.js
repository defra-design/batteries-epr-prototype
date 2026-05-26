import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { runRegulatorOperatorList } from './list/index.js'
import { runRegulatorOperatorDetail } from './detail/index.js'
import { runRegulatorOperatorWithdraw } from './withdraw/index.js'

export const runRegulatorOperatorsPage = (
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
    return runRegulatorOperatorList(doc, loc)
  }

  if (payload.view === 'withdraw') {
    return runRegulatorOperatorWithdraw(doc, loc)
  }

  return runRegulatorOperatorDetail(doc, loc)
}
