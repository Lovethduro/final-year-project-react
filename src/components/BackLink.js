import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { theme } from '../styles/theme';

const PALETTES = {
    default: {
        color: theme.textMuted,
        hoverColor: theme.text,
        iconColor: theme.accent,
        iconBg: 'rgba(255,255,255,0.04)',
        iconBorder: theme.border,
        iconHoverBg: 'rgba(0,45,114,0.12)',
        iconHoverBorder: theme.borderHover,
    },
    auth: {
        color: 'rgba(15,23,42,0.72)',
        hovercolor: '#0F172A',
        iconColor: '#1A4A9E',
        iconBg: 'rgba(255,255,255,0.04)',
        iconBorder: 'rgba(15,23,42,0.1)',
        iconHoverBg: 'rgba(45,212,191,0.1)',
        iconHoverBorder: 'rgba(45,212,191,0.45)',
    },
    subtle: {
        color: theme.textDim,
        hoverColor: theme.textMuted,
        iconColor: 'currentColor',
        compact: true,
    },
};

function applyHover(el, palette, active) {
    el.style.color = active ? palette.hoverColor : palette.color;
    const icon = el.querySelector('[data-back-icon]');
    if (!icon || palette.compact) return;
    icon.style.borderColor = active ? palette.iconHoverBorder : palette.iconBorder;
    icon.style.background = active ? palette.iconHoverBg : palette.iconBg;
}

export function BackLink({
    to,
    onClick,
    label,
    ariaLabel,
    variant = 'default',
    floating = false,
    centered = false,
    style,
}) {
    const palette = PALETTES[variant] || PALETTES.default;
    const accessibleLabel = ariaLabel || label || 'Go back';
    const sharedStyle = {
        display: centered ? 'inline-flex' : 'inline-flex',
        alignItems: 'center',
        gap: label ? (palette.compact ? 8 : 12) : 0,
        padding: palette.compact ? '4px 0' : '6px 0',
        color: palette.color,
        textDecoration: 'none',
        fontSize: palette.compact ? 13 : 14,
        fontWeight: 500,
        letterSpacing: '0.01em',
        fontFamily: theme.fontBody,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
        ...(floating ? { position: 'absolute', top: 24, left: 24, zIndex: 20 } : {}),
        ...(centered ? { justifyContent: 'center' } : {}),
        ...style,
    };

    const content = (
        <>
            <span
                data-back-icon
                style={palette.compact ? {
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: palette.iconColor,
                    flexShrink: 0,
                } : {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: palette.iconBg,
                    border: `1px solid ${palette.iconBorder}`,
                    color: palette.iconColor,
                    flexShrink: 0,
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                }}
            >
                <ChevronLeft size={palette.compact ? 14 : 16} strokeWidth={2} aria-hidden="true" />
            </span>
            {label || null}
        </>
    );

    const handlers = {
        onMouseEnter: (e) => applyHover(e.currentTarget, palette, true),
        onMouseLeave: (e) => applyHover(e.currentTarget, palette, false),
    };

    if (to) {
        return (
            <Link
                to={to}
                aria-label={accessibleLabel}
                className={floating ? 'cyforce-back-link--floating' : undefined}
                style={sharedStyle}
                {...handlers}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={accessibleLabel}
            className={floating ? 'cyforce-back-link--floating' : undefined}
            style={sharedStyle}
            {...handlers}
        >
            {content}
        </button>
    );
}
