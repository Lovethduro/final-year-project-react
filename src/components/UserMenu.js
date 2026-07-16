import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { theme } from '../styles/theme';
import { assetUrl } from '../utils/apiClient';
import { AvatarInitials } from './ui';

export function UserMenu({ auth, profileImage, onLogout }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    const renderAvatar = (size) => (
        profileImage ? (
            <img src={assetUrl(profileImage)} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
            <AvatarInitials name={auth.fullName || auth.email} size={size} />
        )
    );

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(15,23,42,0.04)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    padding: '6px 12px 6px 6px',
                    cursor: 'pointer',
                    color: theme.text,
                    fontFamily: theme.fontBody,
                }}
            >
                {renderAvatar(32)}
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {auth.fullName || 'User'}
                    </div>
                    <div style={{ fontSize: 10, color: theme.textDim, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {auth.email}
                    </div>
                </div>
                <FaChevronDown size={12} color={theme.textDim} aria-hidden="true" />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 260,
                    background: theme.bgCard, border: `1px solid ${theme.border}`,
                    borderRadius: 8, boxShadow: '0 12px 32px rgba(0,45,114,0.12)', zIndex: 500,
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '16px', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {renderAvatar(44)}
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{auth.fullName || 'User'}</div>
                                <div style={{ fontSize: 11, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth.email}</div>
                                {auth.memberSince && (
                                    <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>Member since {auth.memberSince}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        style={{
                            display: 'block', padding: '12px 16px', color: theme.text,
                            textDecoration: 'none', fontSize: 13,
                            borderBottom: `1px solid ${theme.border}`,
                        }}
                    >
                        Profile Settings
                    </Link>
                    <button
                        type="button"
                        onClick={() => { setOpen(false); onLogout(); }}
                        style={{
                            width: '100%', padding: '12px 16px', textAlign: 'left',
                            background: 'rgba(239,68,68,0.08)', color: theme.error,
                            border: 'none', cursor: 'pointer', fontFamily: theme.fontBody,
                            fontSize: 13,
                        }}
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}
