export const MIN_LOCAL_PHONE_DIGITS = 6;
export const MAX_LOCAL_PHONE_DIGITS = 11;
export const MAX_E164_DIGITS = 15;

export function digitsOnly(value) {
    return (value || '').replace(/\D/g, '');
}

export function clampLocalPhoneDigits(localNumber, maxDigits = MAX_LOCAL_PHONE_DIGITS) {
    return digitsOnly(localNumber).slice(0, maxDigits);
}

export function formatInternationalPhone(countryCode, localNumber) {
    const local = digitsOnly(localNumber);
    const code = (countryCode || '').trim();
    if (!code) return local;
    const normalizedCode = code.startsWith('+') ? code : `+${digitsOnly(code)}`;
    return `${normalizedCode}${local}`;
}

export function isValidLocalPhone(
    localNumber,
    minDigits = MIN_LOCAL_PHONE_DIGITS,
    maxDigits = MAX_LOCAL_PHONE_DIGITS,
) {
    const len = digitsOnly(localNumber).length;
    return len >= minDigits && len <= maxDigits;
}

export function isValidInternationalPhone(
    phone,
    minDigits = 10,
    maxDigits = MAX_E164_DIGITS,
) {
    const normalized = (phone || '').trim();
    if (!normalized.startsWith('+')) return false;
    const len = digitsOnly(normalized).length;
    return len >= minDigits && len <= maxDigits;
}

export function countryOptionValue(country) {
    return `${country.code}|${country.country}`;
}

export function parseCountryOptionValue(value) {
    const [code] = (value || '').split('|');
    return code || '+234';
}
