import { describe, expect, test } from 'vitest'

import { calculateProductRequirements } from './calculator.js'

const sectionByKey = (result, key) =>
  result.sections.find((section) => section.key === key)

describe('calculateProductRequirements', () => {
  test('returns no data when there is no registration', () => {
    const result = calculateProductRequirements(null)
    expect(result.hasData).toBe(false)
    expect(result.sections).toEqual([])
  })

  test('computes status for an EV producer with partial declarations', () => {
    const result = calculateProductRequirements({
      bprn: 'NIP1000001',
      batteryCategories: { isElectricVehicle: true },
      carbonFootprint: {
        carbonFootprintValue: '12.4',
        performanceClass: 'B',
        recycledCobalt: '20',
        recycledLithium: '3',
        recycledNickel: ''
      },
      batteryPassport: {
        passportCarrierId: 'BP-123',
        separateCollection: true,
        capacity: true,
        ce: false,
        hazardous: true,
        removability: 'yes'
      }
    })

    expect(result.hasData).toBe(true)
    expect(result.bprn).toBe('NIP1000001')

    const cf = sectionByKey(result, 'carbonFootprint')
    expect(cf.applies).toBe(true)
    expect(cf.status).toBe('declared')
    expect(cf.rows[0].value).toBe('12.4 kg CO2e/kWh')
    expect(cf.rows[1].value).toBe('B')

    const recycled = sectionByKey(result, 'recycledContent')
    expect(recycled.status).toBe('incomplete')
    const byLabel = (label) => recycled.rows.find((r) => r.label === label)
    expect(byLabel('Cobalt').status).toBe('met')
    expect(byLabel('Lithium').status).toBe('below')
    expect(byLabel('Nickel').status).toBe('not-declared')
    expect(byLabel('Nickel').value).toBe('Not declared')
    expect(byLabel('Lead').status).toBe('not-declared')

    const passport = sectionByKey(result, 'batteryPassport')
    expect(passport.status).toBe('provided')
    expect(passport.rows[0].value).toBe('BP-123')
    expect(passport.rows[0].status).toBe('provided')
    expect(
      passport.rows.find((r) => r.label === 'CE marking').value
    ).toBe('Not applied')
    expect(
      passport.rows.find((r) => r.label === 'Removable by the end user').value
    ).toBe('Yes')
  })

  test('flags missing carbon footprint, complete recycled content and missing passport', () => {
    const result = calculateProductRequirements({
      batteryCategories: { isElectricVehicle: true },
      carbonFootprint: {
        performanceClass: 'A',
        recycledCobalt: '20',
        recycledLithium: '10',
        recycledNickel: '10',
        recycledLead: '90'
      },
      batteryPassport: { passportCarrierId: '' }
    })

    expect(sectionByKey(result, 'carbonFootprint').status).toBe('not-declared')
    expect(sectionByKey(result, 'carbonFootprint').rows[0].value).toBe(
      'Not declared'
    )
    expect(sectionByKey(result, 'recycledContent').status).toBe('complete')

    const passport = sectionByKey(result, 'batteryPassport')
    expect(passport.status).toBe('missing')
    expect(passport.rows[0].value).toBe('Not provided')
    expect(
      passport.rows.find((r) => r.label === 'Removable by the end user').value
    ).toBe('Not declared')
  })

  test('marks every requirement not applicable for a portable-only producer', () => {
    const result = calculateProductRequirements({
      batteryCategories: { isPortable: true },
      carbonFootprint: {},
      batteryPassport: {}
    })

    expect(result.sections.map((s) => s.status)).toEqual([
      'not-applicable',
      'not-applicable',
      'not-applicable'
    ])
  })

  test('defaults missing registration sections to empty objects', () => {
    const result = calculateProductRequirements({})

    expect(result.hasData).toBe(true)
    expect(result.bprn).toBeNull()
    expect(result.sections.every((s) => s.status === 'not-applicable')).toBe(true)
  })
})
