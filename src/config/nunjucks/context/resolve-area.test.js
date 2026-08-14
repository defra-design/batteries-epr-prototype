import { resolveArea } from './resolve-area.js'

describe('#resolveArea', () => {
  test('tags the prototype area and hides the dev links', () => {
    expect(resolveArea({ path: '/prototype' })).toEqual({
      areaTag: 'Prototype',
      showDevLinks: false
    })
  })

  test('tags pages nested under the prototype area', () => {
    expect(resolveArea({ path: '/prototype/anything' })).toEqual({
      areaTag: 'Prototype',
      showDevLinks: false
    })
  })

  test('tags the playground area and shows the dev links', () => {
    expect(resolveArea({ path: '/dashboard' })).toEqual({
      areaTag: 'Playground',
      showDevLinks: true
    })
  })

  test('hides the dev links on the area chooser', () => {
    expect(resolveArea({ path: '/' })).toEqual({
      areaTag: 'Playground',
      showDevLinks: false
    })
  })

  test('falls back to the area chooser when there is no request', () => {
    expect(resolveArea()).toEqual({
      areaTag: 'Playground',
      showDevLinks: false
    })
  })
})
