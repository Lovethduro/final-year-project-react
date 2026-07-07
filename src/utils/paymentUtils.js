export function shouldAutoCompletePayment(init) {
    return Boolean(init?.autoComplete || init?.authorizationUrl?.includes('autoComplete=1'));
}

export function isSimulatedPayment(init) {
    return shouldAutoCompletePayment(init);
}

export function isGatewayPaymentUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return url.includes('paystack.co') || url.includes('flutterwave.com');
}

export async function completePaymentIfNeeded(init, paymentApi) {
    if (!init?.reference || !shouldAutoCompletePayment(init)) {
        return null;
    }
    return paymentApi.completeLocalPayment(init.reference);
}
