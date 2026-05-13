export const PAGE_PAYLOAD_ELEMENT_ID = 'page-payload'

export const readPagePayload = (
  doc = globalThis.document,
  id = PAGE_PAYLOAD_ELEMENT_ID
) => {
  const node = doc?.getElementById?.(id)
  if (!node) return null
  try {
    return JSON.parse(node.textContent ?? '')
  } catch (error) {
    console.warn(`[page-payload] failed to parse #${id}: ${error.message}`)
    return null
  }
}
