import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const pagesDir = path.join(dirname, '..', 'src', 'server', 'alphaAssessment', 'pages')

export const greenToBlue = {
  '#16231c': '#0f1a28',
  '#1d2c24': '#162436',
  '#f0ead9': '#eef2f7',
  '#f8f4e8': '#f8fafd',
  '#1a2620': '#16222e',
  '#ece6d6': '#dde7f0',
  '#00a33b': '#1d70b8',
  '#35bd68': '#58a6f0',
  '#0a7434': '#144e81',
  '#2f8f6f': '#2f8ca6',
  '#90a497': '#92a3b5',
  '#5e6b57': '#56677a',
  '#2d3c33': '#2a3a4e',
  '#d6cfba': '#c8d4e2',
  '#3f7e4c': '#3568a8',
  '#7fb35f': '#6fa3d8',
  '#5a8a4e': '#4a7fb5',
  '#0b7d38': '#1d70b8',
  '#2f6f4a': '#2a5f8f',
  '#395643': '#33475e',
  '#5f7468': '#5b7086',
  '#5d7468': '#5a7188',
  '#3a4a40': '#364759',
  '#cdd8cf': '#ccd7e3',
  '#9fb2a6': '#9dafc2',
  '#6f7b68': '#6b7a8c',
  '#e7eee2': '#e6edf5',
  '#dfe6dd': '#dee6f0',
  '#75887d': '#758ba1',
  '#62756a': '#607488',
  '#7d9085': '#7d93a9'
}

const hexToTriple = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',')

export const applyTheme = (source) => {
  let output = source
  for (const [from, to] of Object.entries(greenToBlue)) {
    output = output.replaceAll(from, to)
    output = output.replaceAll(`(${hexToTriple(from)},`, `(${hexToTriple(to)},`)
  }
  return output
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  for (const file of fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'))) {
    const fullPath = path.join(pagesDir, file)
    fs.writeFileSync(fullPath, applyTheme(fs.readFileSync(fullPath, 'utf8')))
    console.log('rethemed', file)
  }
}
