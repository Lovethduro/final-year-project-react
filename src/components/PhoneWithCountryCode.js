import { theme } from '../styles/theme';
import { useMemo, useState } from 'react';
import { COUNTRY_CODES, GROUPED_COUNTRY_CODES } from '../constants/countryCodes';
import { clampLocalPhoneDigits, countryOptionValue, MAX_LOCAL_PHONE_DIGITS } from '../utils/phoneFormat';

const DEFAULT_COUNTRY = COUNTRY_CODES.find((c) => c.country === 'Nigeria') || COUNTRY_CODES[0];

function findCountryByCode(countryCode) {
    return COUNTRY_CODES.find((c) => c.code === countryCode) || DEFAULT_COUNTRY;
}

export function PhoneWithCountryCode({
    label,
    countryCode = '+234',
    localNumber = '',
    onCountryCodeChange,
    onLocalNumberChange,
    placeholder = '801 234 5678',
    required = false,
    maxDigits = MAX_LOCAL_PHONE_DIGITS,
    inputStyle = {},
    labelStyle = {},
}) {
    const selectedCountry = useMemo(() => findCountryByCode(countryCode), [countryCode]);
    const [countryCodeOpen, setCountryCodeOpen] = useState(false);

    const fieldStyle = {
        background: 'rgba(15,23,42,0.04)',
        border: '0.5px solid rgba(0,45,114,0.2)',
        borderRadius: 9,
        padding: '11px 14px',
        fontSize: 14,
        color: '#0F172A',
        outline: 'none',
        ...inputStyle,
    };

    return (
        <div style={{ marginBottom: 12 }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontSize: 12,
                    color: theme.textMuted,
                    marginBottom: 6,
                    ...labelStyle,
                }}
                >
                    {label}{required ? ' *' : ''}
                </label>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', width: 118, flexShrink: 0 }}>
                    <button
                        type="button"
                        onClick={() => setCountryCodeOpen((open) => !open)}
                        aria-label="Country code"
                        style={{
                            ...fieldStyle,
                            width: '100%',
                            marginBottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            padding: '11px 10px',
                        }}
                    >
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                            {selectedCountry.flag} {countryCode}
                        </span>
                        <span style={{ fontSize: 10, color: theme.textDim }}>
                            {countryCodeOpen ? '▲' : '▼'}
                        </span>
                    </button>
                    {countryCodeOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            width: 240,
                            maxHeight: 220,
                            overflowY: 'auto',
                            background: '#F8FAFC',
                            border: '0.5px solid rgba(0,45,114,0.25)',
                            borderRadius: 9,
                            zIndex: 30,
                            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                        }}
                        >
                            {Object.entries(GROUPED_COUNTRY_CODES).map(([group, countries]) => (
                                countries.length > 0 && (
                                    <div key={group}>
                                        <div style={{
                                            padding: '6px 10px',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            color: '#A78BFA',
                                            background: 'rgba(167,139,250,0.08)',
                                        }}
                                        >
                                            {group}
                                        </div>
                                        {countries.map((country) => (
                                            <button
                                                key={countryOptionValue(country)}
                                                type="button"
                                                onClick={() => {
                                                    onCountryCodeChange(country.code);
                                                    setCountryCodeOpen(false);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '8px 10px',
                                                    border: 'none',
                                                    background: country.code === countryCode
                                                        ? 'rgba(0,45,114,0.15)'
                                                        : 'transparent',
                                                    color: '#0F172A',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: 13,
                                                }}
                                            >
                                                <span>{country.flag}</span>
                                                <span>{country.code}</span>
                                                <span style={{ color: theme.textDim, fontSize: 12 }}>
                                                    {country.country}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
                <input
                    style={{ ...fieldStyle, flex: 1, marginBottom: 0 }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={placeholder}
                    value={localNumber}
                    onChange={(e) => onLocalNumberChange(clampLocalPhoneDigits(e.target.value, maxDigits))}
                    maxLength={maxDigits}
                    required={required}
                />
            </div>
        </div>
    );
}

export { DEFAULT_COUNTRY };
