import { useState } from 'react';
import { theme } from '../styles/theme';

/**
 * Password input with optional reveal toggle and read-only-on-mount to reduce autofill on change-password forms.
 */
export function SecurePasswordInput({
    value,
    onChange,
    autoComplete = 'off',
    style,
    onFocus,
    showReveal = true,
    secure = true,
    ...rest
}) {
    const [visible, setVisible] = useState(false);

    const handleFocus = (e) => {
        if (secure) {
            e.target.readOnly = false;
        }
        onFocus?.(e);
    };

    const inputStyle = {
        width: '100%',
        boxSizing: 'border-box',
        paddingRight: showReveal ? 40 : undefined,
        ...style,
    };

    const field = (
        <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            readOnly={secure || undefined}
            onFocus={handleFocus}
            style={inputStyle}
            {...rest}
        />
    );

    if (!showReveal) {
        return field;
    }

    return (
        <div style={{ position: 'relative', width: style?.width || '100%' }}>
            {field}
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                title={visible ? 'Hide password' : 'Show password'}
                style={toggleBtnStyle}
            >
                {visible ? '🙈' : '👁'}
            </button>
        </div>
    );
}

/** Password field with reveal toggle (no autofill guard). Use on login-adjacent flows if needed. */
export function PasswordInput(props) {
    return <SecurePasswordInput secure={false} {...props} />;
}

export function AutofillTrapFields() {
    return (
        <>
            <input
                type="text"
                name="username"
                autoComplete="username"
                tabIndex={-1}
                aria-hidden="true"
                style={trapStyle}
                defaultValue=""
            />
            <input
                type="password"
                name="password"
                autoComplete="current-password"
                tabIndex={-1}
                aria-hidden="true"
                style={trapStyle}
                defaultValue=""
            />
        </>
    );
}

const toggleBtnStyle = {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: theme.textDim,
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: '4px 6px',
    borderRadius: 6,
};

const trapStyle = {
    position: 'absolute',
    left: '-9999px',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
};
