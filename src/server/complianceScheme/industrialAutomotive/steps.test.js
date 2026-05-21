import { STEPS, STEP_ORDER, isKnownStep } from './steps.js'

describe('industrialAutomotive/steps', () => {
  test('STEP_ORDER lists the seven steps in sequence', () => {
    expect(STEP_ORDER).toEqual([
      'placed',
      'exported',
      'taken-back',
      'delivered',
      'check-answers',
      'declaration',
      'confirmation'
    ])
  })

  test('isKnownStep recognises known and unknown', () => {
    expect(isKnownStep('placed')).toBe(true)
    expect(isKnownStep('xxx')).toBe(false)
  })

  test('placed/exported/taken-back/delivered all produce their named patch keys', () => {
    const payload = { industrial: '1', automotive: '2' }
    expect(STEPS.placed.toPatch(payload).placed).toEqual(payload)
    expect(STEPS.exported.toPatch(payload).exported).toEqual(payload)
    expect(STEPS['taken-back'].toPatch(payload).takenBack).toEqual(payload)
    expect(STEPS.delivered.toPatch(payload).delivered).toEqual(payload)
  })

  test('declaration toPatch sets status=submitted with submittedOn timestamp', () => {
    const patch = STEPS.declaration.toPatch({ declarationAccepted: 'yes' })
    expect(patch.status).toBe('submitted')
    expect(typeof patch.submittedOn).toBe('string')
  })
})
