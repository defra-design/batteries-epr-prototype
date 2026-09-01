export const renderPayment = (doc, store) => {
  const reference = store.ensurePrototypePaymentReference()
  doc.querySelector('[data-testid="payment-reference"]').textContent = reference
  return reference
}
