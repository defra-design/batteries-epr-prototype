import { createRequire } from 'node:module'

const seedData = createRequire(import.meta.url)(
  '../../../../client/javascripts/storage-seed.json'
)

// Server-side counterpart to the client's storage-adapter.js. The regulator
// is a different user from the browser-storage journeys, so the invite they
// send lives in process memory: it carries from the form to the confirmation
// page and resets with the "Reset data" dev tool, like the other regulator
// stores. Prototype only — there is no database behind it.
let preRegistrationInvite = null

// The regulator's checks on an application for approval: which of the ten
// steps they have confirmed and the notes they added to each.
const emptyApplicationState = () => ({ checked: {}, notes: {} })
let applicationStates = {}
let applicationDecisions = {}
let memberListDecisions = {}

// Only IronWave Compliance has a member list waiting for a decision. Scheme
// and member details come from the same seed the PoM regulator screens use.
export const MEMBER_LIST_SCHEME_ID = 'ironwave-compliance'

export const getSchemeWithMemberList = (schemeId) =>
  schemeId === MEMBER_LIST_SCHEME_ID
    ? seedData.prototypeRegulatorSchemes.find(
        (scheme) => scheme.id === schemeId
      )
    : null

export const getSchemeMembers = (schemeId) =>
  seedData.prototypeRegulatorSchemeMembers.filter(
    (member) => member.schemeId === schemeId
  )

export const getDashboardCases = () =>
  seedData.prototypeRegulatorRegistrationsDashboardCases

export const getPreRegistrationInvite = () => preRegistrationInvite

export const savePreRegistrationInvite = ({ name, email }) => {
  preRegistrationInvite = { name, email, sentAt: new Date().toISOString() }
  return preRegistrationInvite
}

export const resendPreRegistrationInvite = () => {
  if (preRegistrationInvite) {
    preRegistrationInvite = {
      ...preRegistrationInvite,
      sentAt: new Date().toISOString()
    }
  }
  return preRegistrationInvite
}

export const getApplicationState = (applicationId) =>
  applicationStates[applicationId] ?? emptyApplicationState()

const updateApplicationState = (applicationId, update) => {
  const state = getApplicationState(applicationId)
  applicationStates[applicationId] = update(state)
  return applicationStates[applicationId]
}

export const setStepChecked = (applicationId, step, checked) =>
  updateApplicationState(applicationId, (state) => ({
    ...state,
    checked: { ...state.checked, [step]: checked }
  }))

export const addStepNote = (applicationId, step, text) =>
  updateApplicationState(applicationId, (state) => ({
    ...state,
    notes: {
      ...state.notes,
      [step]: [...(state.notes[step] ?? []), text]
    }
  }))

export const getApplicationDecision = (applicationId) =>
  applicationDecisions[applicationId] ?? null

export const saveApplicationDecision = (applicationId, { outcome, reason }) => {
  applicationDecisions[applicationId] = {
    outcome,
    reason,
    decidedOn: new Date().toISOString()
  }
  return applicationDecisions[applicationId]
}

// Registration numbers are issued in sequence when a member list is accepted.
const FIRST_ISSUED_BPRN = 4901
const formatBprn = (number) => `BPRN-${String(number).padStart(6, '0')}`

export const getMemberListDecision = (schemeId) =>
  memberListDecisions[schemeId] ?? null

export const saveMemberListDecision = (schemeId, { outcome, reason }) => {
  const registrations =
    outcome === 'accept'
      ? getSchemeMembers(schemeId).map((member, index) => ({
          companyName: member.companyName,
          bprn: formatBprn(FIRST_ISSUED_BPRN + index)
        }))
      : []

  memberListDecisions[schemeId] = {
    outcome,
    reason: outcome === 'reject' ? reason : '',
    registrations,
    decidedOn: new Date().toISOString()
  }
  return memberListDecisions[schemeId]
}

export const resetRegistrationsStore = () => {
  memberListDecisions = {}
  preRegistrationInvite = null
  applicationStates = {}
  applicationDecisions = {}
}
