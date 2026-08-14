import { paths } from '../../paths.js'

const isPrototypeArea = (path) => path.startsWith(paths.prototype)

export function resolveArea(request) {
  const path = request?.path ?? paths.home

  return {
    areaTag: isPrototypeArea(path) ? 'Prototype' : 'Playground',
    showDevLinks: !isPrototypeArea(path) && path !== paths.home
  }
}
