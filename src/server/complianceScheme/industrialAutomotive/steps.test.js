import {
  STEPS,
  MEMBER_STEPS,
  STEP_ORDER,
  MEMBER_STEP_ORDER,
  isKnownStep,
  isKnownMemberStep
} from './steps.js'

describe('industrialAutomotive/steps', () => {
  test('STEP_ORDER lists the four steps in sequence', () => {
    expect(STEP_ORDER).toEqual([
      'member-list',
      'check-answers',
      'declaration',
      'confirmation'
    ])
  })

  test('MEMBER_STEP_ORDER lists the four tonnage steps', () => {
    expect(MEMBER_STEP_ORDER).toEqual([
      'placed',
      'exported',
      'taken-back',
      'delivered'
    ])
  })

  test('isKnownStep recognises known and unknown', () => {
    expect(isKnownStep('member-list')).toBe(true)
    expect(isKnownStep('check-answers')).toBe(true)
    expect(isKnownStep('placed')).toBe(false)
    expect(isKnownStep('xxx')).toBe(false)
  })

  test('isKnownMemberStep recognises tonnage steps', () => {
    expect(isKnownMemberStep('placed')).toBe(true)
    expect(isKnownMemberStep('exported')).toBe(true)
    expect(isKnownMemberStep('taken-back')).toBe(true)
    expect(isKnownMemberStep('delivered')).toBe(true)
    expect(isKnownMemberStep('xxx')).toBe(false)
  })

  test('placed/exported/taken-back/delivered MEMBER_STEPS all produce their named patch keys', () => {
    const payload = { industrial: '1', automotive: '2' }
    expect(MEMBER_STEPS.placed.toPatch(payload).placed).toEqual(payload)
    expect(MEMBER_STEPS.exported.toPatch(payload).exported).toEqual(payload)
    expect(MEMBER_STEPS['taken-back'].toPatch(payload).takenBack).toEqual(
      payload
    )
    expect(MEMBER_STEPS.delivered.toPatch(payload).delivered).toEqual(payload)
  })

  test('declaration toPatch sets status=submitted with submittedOn timestamp', () => {
    const patch = STEPS.declaration.toPatch({ declarationAccepted: 'yes' })
    expect(patch.status).toBe('submitted')
    expect(typeof patch.submittedOn).toBe('string')
  })
})
