import { storage, createSchemeMember } from '../../storage-adapter.js'
import { readPagePayload } from '../../page-payload.js'

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char])

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

const ensureScheme = (loc) => {
  storage.seedDemoData()
  const scheme = storage.currentScheme()
  if (!scheme) {
    loc.assign('/compliance-scheme/sign-in')
    return null
  }
  return scheme
}

const renderActive = (doc, members, payload) => {
  const body = doc.querySelector('[data-testid="members-active-body"]')
  const empty = doc.querySelector('[data-testid="members-active-empty"]')
  if (members.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true
  body.innerHTML = members
    .map((m) => {
      const removeHref = payload.urls.removeTemplate.replace(
        '{memberId}',
        m.id
      )
      return `<tr class="govuk-table__row" data-testid="members-active-row">
        <td class="govuk-table__cell" data-testid="members-active-bprn">${escape(m.producerBprn)}</td>
        <td class="govuk-table__cell" data-testid="members-active-company">${escape(m.companyName)}</td>
        <td class="govuk-table__cell" data-testid="members-active-joined">${escape(formatDate(m.joinedOn))}</td>
        <td class="govuk-table__cell"><a class="govuk-link" href="${escape(removeHref)}" data-testid="members-active-remove">${escape(payload.copy.removeAction)}</a></td>
      </tr>`
    })
    .join('')
}

const renderHistory = (doc, members) => {
  const body = doc.querySelector('[data-testid="members-history-body"]')
  const empty = doc.querySelector('[data-testid="members-history-empty"]')
  if (members.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true
  body.innerHTML = members
    .map(
      (m) =>
        `<tr class="govuk-table__row" data-testid="members-history-row">
        <td class="govuk-table__cell">${escape(m.producerBprn)}</td>
        <td class="govuk-table__cell">${escape(m.companyName)}</td>
        <td class="govuk-table__cell">${escape(formatDate(m.joinedOn))}</td>
        <td class="govuk-table__cell">${escape(formatDate(m.leftOn))}</td>
      </tr>`
    )
    .join('')
}

const renderPending = (doc, members, payload) => {
  const body = doc.querySelector('[data-testid="members-pending-body"]')
  const empty = doc.querySelector('[data-testid="members-pending-empty"]')
  if (members.length === 0) {
    body.innerHTML = ''
    empty.hidden = false
    return
  }
  empty.hidden = true
  body.innerHTML = members
    .map(
      (m) =>
        `<tr class="govuk-table__row" data-testid="members-pending-row" data-member-id="${escape(m.id)}">
        <td class="govuk-table__cell" data-testid="members-pending-company">${escape(m.companyName)}</td>
        <td class="govuk-table__cell" data-testid="members-pending-joined">${escape(formatDate(m.joinedOn))}</td>
        <td class="govuk-table__cell">
          <button type="button" class="govuk-button govuk-button--secondary govuk-!-margin-right-2" data-testid="members-pending-accept" data-member-id="${escape(m.id)}">${escape(payload.copy.acceptAction)}</button>
          <button type="button" class="govuk-button govuk-button--warning" data-testid="members-pending-reject" data-member-id="${escape(m.id)}">${escape(payload.copy.rejectAction)}</button>
        </td>
      </tr>`
    )
    .join('')
}

const wirePendingActions = (doc, loc, scheme, payload) => {
  doc.querySelectorAll('[data-testid="members-pending-accept"]').forEach(
    (button) => {
      button.addEventListener('click', () => {
        if (!globalThis.confirm(payload.copy.acceptConfirm)) return
        storage.acceptSchemeMember(button.dataset.memberId, {
          agencyCode: scheme.agencyCode
        })
        loc.reload()
      })
    }
  )
  doc.querySelectorAll('[data-testid="members-pending-reject"]').forEach(
    (button) => {
      button.addEventListener('click', () => {
        if (!globalThis.confirm(payload.copy.rejectConfirm)) return
        storage.rejectSchemeMember(button.dataset.memberId, 'rejected-by-scheme')
        loc.reload()
      })
    }
  )
}

const runListView = (doc, loc, payload, scheme) => {
  const pending = storage
    .listPendingSchemeMembers(scheme.id)
    .filter((m) => m.compliancePeriod === payload.compliancePeriodYear)
  const { active, history } = storage.membersForYear(
    scheme.id,
    payload.compliancePeriodYear
  )
  renderPending(doc, pending, payload)
  renderActive(doc, active, payload)
  renderHistory(doc, history)
  wirePendingActions(doc, loc, scheme, payload)
}

const runAddView = (doc, loc, payload, scheme) => {
  if (payload.target !== 'persist') return
  storage.saveSchemeMember(
    createSchemeMember({
      schemeId: scheme.id,
      producerBprn: payload.member.producerBprn,
      companyName: payload.member.companyName
    })
  )
  loc.assign(payload.next)
}

const runRemoveView = (doc, loc, payload, scheme) => {
  const members = storage.listSchemeMembers(scheme.id)
  const member = members.find((m) => m.id === payload.memberId) ?? null

  if (payload.target === 'persist') {
    if (member && member.leftOn === null) {
      storage.saveSchemeMember({
        ...member,
        leftOn: new Date().toISOString()
      })
    }
    loc.assign(payload.next)
    return
  }

  const notFound = doc.querySelector('[data-testid="members-remove-not-found"]')
  const nameWrap = doc.querySelector('[data-testid="members-remove-name"]')
  const confirm = doc.querySelector('[data-testid="members-remove-confirm"]')
  if (!member || member.leftOn !== null) {
    notFound.hidden = false
    nameWrap.hidden = true
    confirm.disabled = true
    return
  }
  doc.querySelector(
    '[data-testid="members-remove-member-name"]'
  ).textContent = member.companyName
  doc.querySelector(
    '[data-testid="members-remove-member-bprn"]'
  ).textContent = member.producerBprn
}

export const runMembersPage = (
  doc = globalThis.document,
  loc = globalThis.location
) => {
  const payload = readPagePayload(doc)
  const scheme = ensureScheme(loc)
  if (!scheme) return 'redirected-to-sign-in'

  if (payload.view === 'list') {
    runListView(doc, loc, payload, scheme)
    return 'list'
  }
  if (payload.view === 'add') {
    runAddView(doc, loc, payload, scheme)
    return payload.target === 'persist' ? 'navigated' : 'hydrated'
  }
  runRemoveView(doc, loc, payload, scheme)
  return payload.target === 'persist' ? 'navigated' : 'hydrated'
}
