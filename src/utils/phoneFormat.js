export function digitsOnly(value) {
    return (value || '').replace(/\D/g, '');
}

export function formatInternationalPhone(countryCode, localNumber) {
    const local = digitsOnly(localNumber);
    const code = (countryCode || '').trim();
    if (!code) return local;
    const normalizedCode = code.startsWith('+') ? code : `+${digitsOnly(code)}`;
    return `${normalizedCode}${local}`;
}

export function isValidLocalPhone(localNumber, minDigits = 6) {
    return digitsOnly(localNumber).length >= minDigits;
}

export function isValidInternationalPhone(phone, minDigits = 10) {
    const normalized = (phone || '').trim();
    if (!normalized.startsWith('+')) return false;
    return digitsOnly(normalized).length >= minDigits;
}

export function countryOptionValue(country) {
    return `${country.code}|${country.country}`;
}

export function parseCountryOptionValue(value) {
    const [code] = (value || '').split('|');
    return code || '+234';
}
