import { batteryTypesSummary } from '../registration/check-answers.js'
import { unitSuffix } from './data-totals.js'

const setRowValue = (doc, rowKey, value) => {
  const el = doc.querySelector(`[data-testid="check-data-value-${rowKey}"]`)
  el.textContent = value || '—'
}

export const renderCheckData = (doc, registration, submission) => {
  const suffix = unitSuffix(submission.unit)
  const weight = (value) => `${parseFloat(value) || 0}${suffix}`
  const totalWeight =
    (parseFloat(submission.weightLeadAcid) || 0) +
    (parseFloat(submission.weightNickelCadmium) || 0) +
    (parseFloat(submission.weightOther) || 0)

  setRowValue(doc, 'batteryTypes', batteryTypesSummary(registration))
  setRowValue(
    doc,
    'brandNames',
    submission.hasBrand === 'yes'
      ? (submission.brandNames ?? []).join(', ')
      : 'None'
  )
  setRowValue(doc, 'leadAcid', weight(submission.weightLeadAcid))
  setRowValue(doc, 'nickelCadmium', weight(submission.weightNickelCadmium))
  setRowValue(doc, 'other', weight(submission.weightOther))
  setRowValue(doc, 'total', `${Math.round(totalWeight * 1000) / 1000}${suffix}`)
}
