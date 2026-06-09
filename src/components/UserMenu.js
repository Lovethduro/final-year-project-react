import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import { assetUrl } from '../utils/apiClient';

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

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: `0.5px solid ${theme.border}`,
                    borderRadius: 10,
                    padding: '6px 12px 6px 6px',
                    cursor: 'pointer',
                    color: theme.text,
                    fontFamily: theme.fontBody,
                }}
            >
                <div style={{
                    width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.08)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {profileImage ? (
                        <img src={assetUrl(profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: 16 }}>👤</span>
                    )}
                </div>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {auth.fullName || 'User'}
                    </div>
                    <div style={{ fontSize: 10, color: theme.textDim, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {auth.email}
                    </div>
                </div>
                <span style={{ fontSize: 10, color: theme.textDim }}>▼</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 260,
                    background: theme.bgCard, border: `0.5px solid ${theme.border}`,
                    borderRadius: 14, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 500,
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '16px', borderBottom: `0.5px solid ${theme.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                                background: 'rgba(255,255,255,0.08)', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {profileImage ? (
                                    <img src={assetUrl(profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: 20 }}>👤</span>
                                )}
                            </div>
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
                            borderBottom: `0.5px solid ${theme.border}`,
                        }}
                    >
                        👤 Profile Settings
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
