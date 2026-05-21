import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { hydrateForm } from '../../hydrate-form.js'

const firstScheme = () => storage.listSchemes()[0]

const ensureScheme = () => {
  storage.seedDemoData()
  return firstScheme()
}

const setText = (doc, selector, text) => {
  doc.querySelector(selector).textContent = text
}

const formValuesForStep = (step, submission) => {
  if (step === 'market-data') {
    return submission?.marketData ?? null
  }
  if (step === 'waste-data') {
    return submission?.wasteData ?? null
  }
  if (step === 'declaration') {
    return {
      declarationAccepted: submission?.status === 'submitted' ? 'yes' : ''
    }
  }
  return null
}

const renderCheckAnswers = (doc, submission) => {
  const market = submission?.marketData ?? {}
  const waste = submission?.wasteData ?? {}
  setText(doc, '[data-testid="quarterly-check-market-portable"]', market.portable ?? '—')
  setText(doc, '[data-testid="quarterly-check-market-industrial"]', market.industrial ?? '—')
  setText(doc, '[data-testid="quarterly-check-market-automotive"]', market.automotive ?? '—')
  setText(doc, '[data-testid="quarterly-check-waste-portable"]', waste.portable ?? '—')
  setText(doc, '[data-testid="quarterly-check-waste-industrial"]', waste.industrial ?? '—')
  setText(doc, '[data-testid="quarterly-check-waste-automotive"]', waste.automotive ?? '—')
}

export const runQuarterlyStep = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme()

  if (payload.target === 'persist') {
    storage.upsertQuarterlySubmission(
      scheme.id,
      payload.compliancePeriodYear,
      payload.quarter,
      payload.patch
    )
    if (payload.next) {
      loc.assign(payload.next)
      return 'navigated'
    }
    return 'persisted'
  }

  const submission = storage.findQuarterlySubmission(
    scheme.id,
    payload.compliancePeriodYear,
    payload.quarter
  )

  if (payload.step === 'check-answers') {
    renderCheckAnswers(doc, submission)
    return 'hydrated'
  }

  const values = formValuesForStep(payload.step, submission)
  if (values) hydrateForm(doc.querySelector('form'), values)
  return 'hydrated'
}
