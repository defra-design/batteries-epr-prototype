export const renderPaymentConfirmed = (doc, submission) => {
  doc.querySelector('[data-testid="payment-confirmed-reference"]').textContent =
    submission.paymentReference || ''
}
