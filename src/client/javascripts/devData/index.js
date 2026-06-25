import {
  STORAGE_KEYS,
  createProducer,
  createRegistration,
  createSubmission,
  createScheme,
  createSchemeMember,
  createQuarterlySubmission,
  createIaSubmission,
  createEvidence,
  createOperator,
  createOperatorQuarterlyReturn,
  createOperatorAnnualReturn
} from '../storage-adapter.js'
import { NI_STORAGE_KEYS } from '../ni/storage.js'

const NI_REGISTRATION_SCHEMA = {
  id: 'uuid',
  bprn: 'NIP0000000',
  period: '2026',
  status: 'Registered',
  companyDetails: {},
  contactDetails: {},
  batteryCategories: {},
  brandNames: {},
  producerRoute: {},
  carbonFootprint: {},
  batteryPassport: {},
  dueDiligence: {},
  declaration: {},
  createdAt: 'ISO date',
  updatedAt: 'ISO date',
  version: 0
}

const NI_ANNUAL_RETURN_SCHEMA = {
  id: 'uuid',
  period: '2026',
  reference: 'NI-AR-000000',
  status: 'Submitted',
  categories: {},
  placedOnMarket: {},
  collection: {},
  recyclingEfficiency: {},
  declaration: {},
  createdAt: 'ISO date',
  updatedAt: 'ISO date',
  version: 0
}

const PRODUCER = 'Producer (GB)'
const SCHEME = 'Compliance scheme (GB)'
const OPERATOR = 'Operator (GB)'
const EVIDENCE = 'Evidence (GB)'
const SESSION = 'Session and dev (GB)'
const NORTHERN_IRELAND = 'Northern Ireland (EUBR)'

const JOURNEYS = [PRODUCER, SCHEME, OPERATOR, EVIDENCE, SESSION, NORTHERN_IRELAND]

const REGISTRY = [
  { key: STORAGE_KEYS.producers, label: 'Producers', journey: PRODUCER, kind: 'map', schema: createProducer() },
  { key: STORAGE_KEYS.registrations, label: 'Registrations', journey: PRODUCER, kind: 'map', schema: createRegistration() },
  { key: STORAGE_KEYS.submissions, label: 'Annual return submissions', journey: PRODUCER, kind: 'map', schema: createSubmission() },
  { key: STORAGE_KEYS.payments, label: 'Payments', journey: PRODUCER, kind: 'map', schema: null },
  { key: STORAGE_KEYS.schemes, label: 'Schemes', journey: SCHEME, kind: 'map', schema: createScheme() },
  { key: STORAGE_KEYS.schemeMembers, label: 'Scheme members', journey: SCHEME, kind: 'map', schema: createSchemeMember() },
  { key: STORAGE_KEYS.quarterlySubmissions, label: 'Quarterly submissions', journey: SCHEME, kind: 'map', schema: createQuarterlySubmission() },
  { key: STORAGE_KEYS.iaSubmissions, label: 'IA submissions', journey: SCHEME, kind: 'map', schema: createIaSubmission() },
  { key: STORAGE_KEYS.operators, label: 'Operators', journey: OPERATOR, kind: 'map', schema: createOperator() },
  { key: STORAGE_KEYS.operatorQuarterlyReturns, label: 'Operator quarterly returns', journey: OPERATOR, kind: 'map', schema: createOperatorQuarterlyReturn() },
  { key: STORAGE_KEYS.operatorAnnualReturns, label: 'Operator annual returns', journey: OPERATOR, kind: 'map', schema: createOperatorAnnualReturn() },
  { key: STORAGE_KEYS.evidence, label: 'Evidence', journey: EVIDENCE, kind: 'map', schema: createEvidence() },
  { key: STORAGE_KEYS.currentUser, label: 'Current user', journey: SESSION, kind: 'single', schema: null },
  { key: STORAGE_KEYS.currentSchemeId, label: 'Current scheme id', journey: SESSION, kind: 'scalar', schema: null },
  { key: STORAGE_KEYS.currentOperatorId, label: 'Current operator id', journey: SESSION, kind: 'scalar', schema: null },
  { key: STORAGE_KEYS.currentAgencyCode, label: 'Current agency code', journey: SESSION, kind: 'scalar', schema: null },
  { key: STORAGE_KEYS.seedVersion, label: 'Seed version', journey: SESSION, kind: 'scalar', schema: null },
  { key: STORAGE_KEYS.timeTravelTargetYear, label: 'Time-travel target year', journey: SESSION, kind: 'scalar', schema: null },
  { key: NI_STORAGE_KEYS.registration, label: 'NI registration', journey: NORTHERN_IRELAND, kind: 'single', schema: NI_REGISTRATION_SCHEMA },
  { key: NI_STORAGE_KEYS.annualReturns, label: 'NI annual returns', journey: NORTHERN_IRELAND, kind: 'map', schema: NI_ANNUAL_RETURN_SCHEMA }
]

const typeLabel = (value) => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

const safeParse = (raw) => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const toEntries = (kind, key) => {
  const raw = globalThis.localStorage.getItem(key)
  if (raw === null) return []
  if (kind === 'scalar') return [{ title: key, value: raw }]
  const parsed = safeParse(raw)
  if (kind === 'map') {
    return Object.entries(parsed ?? {}).map(([id, value]) => ({
      title: id,
      value
    }))
  }
  return [{ title: 'record', value: parsed }]
}

const el = (doc, tag, className, text) => {
  const node = doc.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

const valueCell = (doc, value) => {
  const dd = el(doc, 'dd', 'govuk-summary-list__value')
  if (value !== null && typeof value === 'object') {
    dd.appendChild(el(doc, 'pre', undefined, JSON.stringify(value)))
  } else {
    dd.textContent = String(value)
  }
  return dd
}

const summaryRow = (doc, field, value) => {
  const row = el(doc, 'div', 'govuk-summary-list__row')
  row.appendChild(el(doc, 'dt', 'govuk-summary-list__key', field))
  row.appendChild(valueCell(doc, value))
  return row
}

const renderSchema = (doc, schema) => {
  const table = el(doc, 'table', 'govuk-table')
  const head = el(doc, 'thead', 'govuk-table__head')
  const headRow = el(doc, 'tr', 'govuk-table__row')
  ;['Field', 'Type', 'Default'].forEach((label) => {
    const th = el(doc, 'th', 'govuk-table__header', label)
    th.setAttribute('scope', 'col')
    headRow.appendChild(th)
  })
  head.appendChild(headRow)
  table.appendChild(head)

  const body = el(doc, 'tbody', 'govuk-table__body')
  Object.entries(schema).forEach(([field, value]) => {
    const row = el(doc, 'tr', 'govuk-table__row')
    row.appendChild(el(doc, 'td', 'govuk-table__cell', field))
    row.appendChild(el(doc, 'td', 'govuk-table__cell', typeLabel(value)))
    row.appendChild(el(doc, 'td', 'govuk-table__cell', JSON.stringify(value)))
    body.appendChild(row)
  })
  table.appendChild(body)
  return table
}

const renderRecord = (doc, entry) => {
  const details = el(doc, 'details', 'govuk-details')
  details.appendChild(el(doc, 'summary', 'govuk-details__summary-text', entry.title))
  const text = el(doc, 'div', 'govuk-details__text')
  if (entry.value !== null && typeof entry.value === 'object') {
    const list = el(doc, 'dl', 'govuk-summary-list')
    Object.entries(entry.value).forEach(([field, value]) =>
      list.appendChild(summaryRow(doc, field, value))
    )
    text.appendChild(list)
  } else {
    text.appendChild(el(doc, 'p', 'govuk-body', String(entry.value)))
  }
  details.appendChild(text)
  return details
}

const copyToClipboard = (text) => globalThis.navigator.clipboard.writeText(text)

const renderRecordRow = (doc, entry) => {
  const row = el(doc, 'div', 'app-record')
  row.appendChild(renderRecord(doc, entry))
  const button = el(doc, 'button', 'app-copy-json', 'Copy as JSON')
  button.setAttribute('type', 'button')
  button.setAttribute('data-dev-copy', entry.title)
  button.addEventListener('click', () =>
    copyToClipboard(JSON.stringify(entry.value, null, 2))
  )
  row.appendChild(button)
  return row
}

const renderRecords = (doc, entries) => {
  if (entries.length === 0) {
    return el(doc, 'p', 'govuk-body', 'No records stored.')
  }
  const wrapper = el(doc, 'div')
  entries.forEach((entry) => wrapper.appendChild(renderRecordRow(doc, entry)))
  return wrapper
}

const renderEntity = (doc, entity) => {
  const entries = toEntries(entity.kind, entity.key)
  const section = el(doc, 'section', 'govuk-!-margin-bottom-6')
  section.setAttribute('data-dev-entity', entity.key)
  section.appendChild(
    el(
      doc,
      'h3',
      'govuk-heading-s govuk-!-margin-bottom-1',
      `${entity.label} — ${entity.key} (${entries.length})`
    )
  )
  if (entity.schema) section.appendChild(renderSchema(doc, entity.schema))
  section.appendChild(renderRecords(doc, entries))
  return section
}

export const initDevData = (doc = globalThis.document) => {
  const root = doc.querySelector('[data-dev-data-root]')
  JOURNEYS.forEach((journey) => {
    const details = el(doc, 'details', 'govuk-details')
    details.setAttribute('data-dev-journey', journey)
    const summary = el(doc, 'summary', 'govuk-details__summary')
    summary.appendChild(el(doc, 'span', 'govuk-details__summary-text', journey))
    details.appendChild(summary)
    const body = el(doc, 'div', 'govuk-details__text')
    REGISTRY.filter((entity) => entity.journey === journey).forEach((entity) =>
      body.appendChild(renderEntity(doc, entity))
    )
    details.appendChild(body)
    root.appendChild(details)
  })
}
