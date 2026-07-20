import { describe, expect, test } from 'vitest'

import {
  BATTERY_CATEGORIES,
  CATEGORY_CAVEAT,
  categoryFieldName,
  categoryFlagName,
  categoryIds,
  categoryLabels,
  categoryShortLabels,
  emptyCategoryMap
} from './battery-categories.js'

describe('battery-categories', () => {
  test('categoryIds preserves the configured order', () => {
    expect(categoryIds).toEqual(['portable', 'industrial', 'automotive'])
  })

  test('every category has an id, label and shortLabel', () => {
    for (const category of BATTERY_CATEGORIES) {
      expect(category.id).toBeTruthy()
      expect(category.label).toBeTruthy()
      expect(category.shortLabel).toBeTruthy()
    }
  })

  test('categoryLabels maps each id to its display label', () => {
    expect(categoryLabels).toEqual({
      portable: 'Portable batteries',
      industrial: 'Industrial batteries',
      automotive: 'Automotive batteries'
    })
  })

  test('categoryShortLabels maps each id to its short label', () => {
    expect(categoryShortLabels).toEqual({
      portable: 'Portable',
      industrial: 'Industrial',
      automotive: 'Automotive'
    })
  })

  test('categoryFieldName capitalises the id behind a prefix', () => {
    expect(categoryFieldName('collection', 'portable')).toBe(
      'collectionPortable'
    )
    expect(categoryFieldName('recycling', 'industrial')).toBe(
      'recyclingIndustrial'
    )
  })

  test('categoryFlagName builds an is<Category> flag name', () => {
    expect(categoryFlagName('portable')).toBe('isPortable')
    expect(categoryFlagName('automotive')).toBe('isAutomotive')
  })

  test('emptyCategoryMap defaults every category to zero', () => {
    expect(emptyCategoryMap()).toEqual({
      portable: 0,
      industrial: 0,
      automotive: 0
    })
  })

  test('emptyCategoryMap accepts a custom fill value', () => {
    expect(emptyCategoryMap('')).toEqual({
      portable: '',
      industrial: '',
      automotive: ''
    })
  })

  test('exposes a demonstration-categories caveat', () => {
    expect(CATEGORY_CAVEAT).toMatch(/demonstration/i)
  })
})
