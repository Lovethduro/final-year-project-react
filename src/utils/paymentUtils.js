export function shouldAutoCompletePayment(init) {
    return Boolean(init?.autoComplete || init?.authorizationUrl?.includes('autoComplete=1'));
}

export async function completePaymentIfNeeded(init, paymentApi) {
    if (!init?.reference || !shouldAutoCompletePayment(init)) {
        return false;
    }
    await paymentApi.completeLocalPayment(init.reference);
    return true;
}
