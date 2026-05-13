import { renderComponent } from '../../test-helpers/component-helpers.js'

describe('Heading Component', () => {
  let $heading

  describe('With caption', () => {
    beforeEach(() => {
      $heading = renderComponent('heading', {
        text: 'Services',
        caption: 'A page showing available services',
        organisationName: 'Organisation Name'
      })
    })

    test('Should render app heading component', () => {
      expect($heading('[data-testid="app-heading"]')).toHaveLength(1)
    })

    test('Should contain expected heading', () => {
      expect($heading('[data-testid="app-heading-title"]').text().trim()).toBe(
        'Services'
      )
    })

    test('Should have expected heading caption', () => {
      expect(
        $heading('[data-testid="app-heading-caption"]').text().trim()
      ).toBe('A page showing available services')
    })

    test('Should have expected organisation name', () => {
      expect(
        $heading('[data-testid="app-heading-organisation-name"]').text().trim()
      ).toBe('Organisation Name')
    })
  })

  describe('Without optional fields', () => {
    beforeEach(() => {
      $heading = renderComponent('heading', { text: 'Plain Heading' })
    })

    test('Should render heading text only', () => {
      expect($heading('[data-testid="app-heading-title"]').text().trim()).toBe(
        'Plain Heading'
      )
    })

    test('Should not render caption', () => {
      expect($heading('[data-testid="app-heading-caption"]')).toHaveLength(0)
    })

    test('Should not render organisation name', () => {
      expect(
        $heading('[data-testid="app-heading-organisation-name"]')
      ).toHaveLength(0)
    })
  })
})
