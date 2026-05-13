import { storage } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'
import { escape, formatAddress, formatBatteryTypes } from '../render-helpers.js'

const renderResultRow = (item, detailUrl) => `
  <li class="govuk-summary-card" data-testid="register-result">
    <div class="govuk-summary-card__title-wrapper">
      <h2 class="govuk-summary-card__title">
        <a class="govuk-link" href="${escape(detailUrl)}" data-testid="register-result-link">${escape(item.companyName)}</a>
      </h2>
    </div>
    <div class="govuk-summary-card__content">
      <dl class="govuk-summary-list">
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">BPRN</dt>
          <dd class="govuk-summary-list__value" data-testid="register-result-bprn">${escape(item.bprn)}</dd>
        </div>
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">Registered address</dt>
          <dd class="govuk-summary-list__value">${escape(formatAddress(item.registeredAddress))}</dd>
        </div>
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">Battery types</dt>
          <dd class="govuk-summary-list__value">${escape(formatBatteryTypes(item.batteryTypes))}</dd>
        </div>
        <div class="govuk-summary-list__row">
          <dt class="govuk-summary-list__key">Brand names</dt>
          <dd class="govuk-summary-list__value">${escape((item.brandNames || []).join(', ') || 'None')}</dd>
        </div>
      </dl>
    </div>
  </li>
`

const renderPagination = (currentPage, totalPages, baseQuery) => {
  if (totalPages <= 1) return ''
  const link = (page, label) => {
    const params = new URLSearchParams(baseQuery)
    params.set('page', String(page))
    return `<li class="govuk-pagination__item"><a class="govuk-link govuk-pagination__link" href="?${params.toString()}" data-testid="pagination-${label}">${label}</a></li>`
  }
  const items = []
  if (currentPage > 1) items.push(link(currentPage - 1, 'previous'))
  for (let p = 1; p <= totalPages; p += 1) {
    items.push(link(p, `page-${p}`))
  }
  if (currentPage < totalPages) items.push(link(currentPage + 1, 'next'))
  return `<nav class="govuk-pagination" aria-label="Results"><ul class="govuk-pagination__list">${items.join('')}</ul></nav>`
}

const buildDetailUrl = (template, bprn) =>
  template.replace('{bprn}', encodeURIComponent(bprn))

export const renderSearchResults = (
  doc = globalThis.document,
  query = readQuery(),
  detailUrlTemplate = readDetailTemplate(doc)
) => {
  storage.seedDemoData()
  const result = storage.searchPublicRegister(query)
  const container = doc.getElementById('register-results')
  if (!container) return result

  if (result.totalCount === 0) {
    container.innerHTML = `<p class="govuk-body" data-testid="register-no-results">No producers found.</p>`
    return result
  }

  const items = result.items
    .map((item) =>
      renderResultRow(item, buildDetailUrl(detailUrlTemplate, item.bprn))
    )
    .join('')
  const pagination = renderPagination(result.page, result.totalPages, {
    q: query.q ?? '',
    bprn: query.bprn ?? '',
    postcode: query.postcode ?? ''
  })

  container.innerHTML = `
    <p class="govuk-body" data-testid="register-result-count">${result.totalCount} producer${result.totalCount === 1 ? '' : 's'} found.</p>
    <ul class="govuk-list" data-testid="register-results-list">${items}</ul>
    ${pagination}
  `
  return result
}

const readQuery = (loc = globalThis.location) => {
  const params = new URLSearchParams(loc?.search ?? '')
  const pageNumber = Number(params.get('page')) || 1
  return {
    q: params.get('q') ?? '',
    bprn: params.get('bprn') ?? '',
    postcode: params.get('postcode') ?? '',
    page: pageNumber
  }
}

const readDetailTemplate = (doc) => {
  const payload = readPagePayload(doc)
  return payload?.detailUrlTemplate ?? '/register/{bprn}'
}

export const prefillForm = (doc = globalThis.document, query = readQuery()) => {
  const set = (name, value) => {
    const node = doc.querySelector(`[name="${name}"]`)
    if (node) node.value = value ?? ''
  }
  set('q', query.q)
  set('bprn', query.bprn)
  set('postcode', query.postcode)
}

export const initSearch = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const query = readQuery(loc)
  prefillForm(doc, query)
  return renderSearchResults(doc, query, readDetailTemplate(doc))
}
