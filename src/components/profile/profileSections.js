import { Card, Alert, PrimaryButton, AvatarInitials } from '../ui';
import { inputStyle } from '../../styles/theme';
import { theme, formatRoleLabel } from '../../styles/theme';
import { assetUrl } from '../../utils/apiClient';
import { AgentStarBadge } from '../StarRatingInput';

export const labelStyle = { display: 'block', fontSize: 12, color: theme.textDim, marginBottom: 6 };

export function ProfileAlerts({ error, success }) {
    return (
        <>
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}
        </>
    );
}

export function ProfilePhotoCard({ profile, profileImage, form, uploading, onUpload, photoHint }) {
    return (
        <Card title="Profile Photo">
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                    width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                    flexShrink: 0,
                }}>
                    {profileImage ? (
                        <img src={assetUrl(profileImage)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <AvatarInitials name={form.fullName || profile?.fullName || profile?.email} size={96} fontSize={28} />
                    )}
                </div>
                <div>
                    <label style={{ fontSize: 13, color: theme.accent, cursor: 'pointer', fontWeight: 600 }}>
                        {uploading ? 'Uploading…' : 'Upload photo'}
                        <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files?.[0])} />
                    </label>
                    <p style={{ fontSize: 12, color: theme.textDim, marginTop: 8, lineHeight: 1.5, maxWidth: 320 }}>
                        {photoHint}
                    </p>
                    {profile?.createdAt && (
                        <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 12 }}>
                            Member since <strong style={{ color: theme.text }}>{profile.createdAt}</strong>
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}

export function PreferencesCard({ form, onMotivationalToggle, staff = false }) {
    return (
        <Card title="Preferences">
            <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                cursor: 'pointer',
                fontSize: 14,
                color: theme.textMuted,
            }}>
                <input
                    type="checkbox"
                    checked={form.showMotivationalMessages}
                    onChange={(e) => onMotivationalToggle(e.target.checked)}
                    style={{ marginTop: 3, accentColor: theme.accent }}
                />
                <span>
                    <strong style={{ display: 'block', color: theme.text, marginBottom: 4 }}>Show motivational messages</strong>
                    {staff
                        ? 'Display brief tips on your workspace dashboard. Turn off for a quieter view.'
                        : 'Display tips and updates on your customer dashboard. Turn off if you prefer fewer prompts.'}
                </span>
            </label>
        </Card>
    );
}

export function PasswordCard({ passwordForm, setPasswordForm, passwordSaving, passwordSuccess, onSubmit }) {
    return (
        <Card title="Change Password">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={labelStyle}>Current password</label>
                    <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        style={inputStyle}
                        autoComplete="current-password"
                    />
                </div>
                <div>
                    <label style={labelStyle}>New password</label>
                    <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                        style={inputStyle}
                        autoComplete="new-password"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        style={inputStyle}
                        autoComplete="new-password"
                    />
                </div>
                {passwordSuccess && <Alert type="success">{passwordSuccess}</Alert>}
                <PrimaryButton onClick={onSubmit} disabled={passwordSaving}>
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                </PrimaryButton>
            </div>
        </Card>
    );
}

function SecurityRow({ label, value, valueColor }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span>{label}</span>
            <strong style={{ color: valueColor || theme.text, textAlign: 'right' }}>{value}</strong>
        </div>
    );
}

export function StaffSecurityCard({ profile, role }) {
    const showRating = ['SALES_AGENT', 'SUPPORT_AGENT'].includes(role);
    return (
        <Card title="Account & Security">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: theme.textMuted }}>
                <SecurityRow label="Role" value={formatRoleLabel(role)} valueColor={theme.accent} />
                <SecurityRow label="Member since" value={profile?.createdAt || '—'} />
                <SecurityRow
                    label="Email verified"
                    value={profile?.emailVerified ? 'Yes' : 'No'}
                    valueColor={profile?.emailVerified ? theme.success : theme.warning}
                />
                <SecurityRow
                    label="MFA"
                    value={profile?.mfaEnabled ? `Enabled (${profile?.mfaMethod || 'active'})` : 'Not enabled'}
                    valueColor={profile?.mfaEnabled ? theme.success : theme.warning}
                />
                <SecurityRow
                    label="Account status"
                    value={profile?.active ? 'Active' : 'Inactive'}
                    valueColor={profile?.active ? theme.success : theme.error}
                />
                {showRating && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: `1px solid ${theme.border}` }}>
                        <span>Customer rating</span>
                        <AgentStarBadge rating={profile?.averageRating} count={profile?.ratingCount} />
                    </div>
                )}
            </div>
        </Card>
    );
}

export function CustomerSecurityCard({ profile, formatPaymentMethod }) {
    return (
        <Card title="Account & Security">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: theme.textMuted }}>
                <SecurityRow label="Account type" value={profile?.customerType ? formatRoleLabel(profile.customerType) : '—'} />
                <SecurityRow label="Member since" value={profile?.createdAt || '—'} />
                <SecurityRow label="Payment method" value={formatPaymentMethod(profile?.preferredPaymentMethod)} valueColor={theme.accent} />
                <SecurityRow
                    label="Email verified"
                    value={profile?.emailVerified ? 'Yes' : 'No'}
                    valueColor={profile?.emailVerified ? theme.success : theme.warning}
                />
                <SecurityRow
                    label="MFA"
                    value={profile?.mfaEnabled ? `Enabled (${profile?.mfaMethod || 'active'})` : 'Not enabled'}
                    valueColor={profile?.mfaEnabled ? theme.success : theme.warning}
                />
                <SecurityRow
                    label="Account status"
                    value={profile?.active ? 'Active' : 'Inactive'}
                    valueColor={profile?.active ? theme.success : theme.error}
                />
            </div>
        </Card>
    );
}

export function StaffWorkCard({ role, profile }) {
    const copy = {
        ADMIN: {
            title: 'Administrator access',
            body: 'You have full system access including user management, security audit, and configuration.',
        },
        SUPERVISOR: {
            title: 'Supervisor access',
            body: 'You can oversee team performance, approve requests, and review escalated conversations.',
        },
        SALES_AGENT: {
            title: 'Sales workspace',
            body: 'Manage leads, customer messages, and deals. Your profile photo may appear when customers chat with you.',
        },
        SUPPORT_AGENT: {
            title: 'Support workspace',
            body: 'Handle tickets and customer issues. Your profile photo may appear in support conversations.',
        },
    };
    const info = copy[role] || copy.SUPPORT_AGENT;

    return (
        <Card title="Work Profile">
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>{info.title}</div>
                <p style={{ fontSize: 13, color: theme.textMuted, margin: 0, lineHeight: 1.55 }}>{info.body}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                <div style={{ padding: '12px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.textDim, marginBottom: 4 }}>Role</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{formatRoleLabel(role)}</div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.textDim, marginBottom: 4 }}>Email</div>
                    <div style={{ fontSize: 13, color: theme.text, wordBreak: 'break-all' }}>{profile?.email || '—'}</div>
                </div>
            </div>
        </Card>
    );
}
