import { PageHeader, Card, PrimaryButton } from '../ui';
import { inputStyle } from '../../styles/theme';
import { formatRoleLabel } from '../../styles/theme';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import {
    labelStyle,
    ProfileAlerts,
    ProfilePhotoCard,
    PreferencesCard,
    PasswordCard,
    StaffSecurityCard,
    StaffWorkCard,
    MfaSettingsCard,
} from './profileSections';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';

const STAFF_PHOTO_HINT = {
    SALES_AGENT: 'Shown to customers in sales chat. Use a clear, professional headshot. Max 5MB.',
    SUPPORT_AGENT: 'Shown to customers in support conversations. Use a clear, professional headshot. Max 5MB.',
    SUPERVISOR: 'Visible within the CRM to your team. Max 5MB.',
    ADMIN: 'Visible within the CRM for administration and audit context. Max 5MB.',
};

const STAFF_SUBTITLE = {
    ADMIN: 'Administrator account settings and security',
    SUPERVISOR: 'Supervisor account settings and team access',
    SALES_AGENT: 'Your sales workspace identity and contact details',
    SUPPORT_AGENT: 'Your support workspace identity and contact details',
};

export default function StaffProfileView({ role }) {
    const settings = useProfileSettings();
    const {
        profile, form, error, success, saving, uploading,
        passwordForm, setPasswordForm, passwordSaving, passwordSuccess,
        handleChange, handleImageUpload, handleSave, handlePasswordChange, handleMotivationalToggle,
        handleDisableMfa, prepareDisableMfa, disablingMfa, mfaError, mfaSuccess,
        profileImage,
    } = settings;

    const saveStaff = () => handleSave({
        fullName: form.fullName,
        phone: form.phone,
        showMotivationalMessages: form.showMotivationalMessages,
    });

    return (
        <>
                    <PageHeader
                title={`${formatRoleLabel(role)} Profile`}
                subtitle={STAFF_SUBTITLE[role] || 'Staff account settings and security'}
            />
            <ProfileAlerts error={error} success={success} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <ProfilePhotoCard
                    profile={profile}
                    profileImage={profileImage}
                    form={form}
                    uploading={uploading}
                    onUpload={handleImageUpload}
                    photoHint={STAFF_PHOTO_HINT[role] || 'JPG, PNG, WEBP or GIF. Max 5MB.'}
                />

                <StaffWorkCard role={role} profile={profile} />

                <Card title="Contact Details">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input value={form.fullName} onChange={handleChange('fullName')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Work Email</label>
                            <input value={profile?.email || ''} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input value={form.phone} onChange={handleChange('phone')} style={inputStyle} placeholder="+2348012345678" />
                        </div>
                        <PrimaryButton onClick={saveStaff} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                    </div>
                </Card>

                <PreferencesCard form={form} onMotivationalToggle={handleMotivationalToggle} staff />
                <MfaSettingsCard
                    profile={profile}
                    onDisableMfa={handleDisableMfa}
                    onPrepareDisableMfa={prepareDisableMfa}
                    disablingMfa={disablingMfa}
                    mfaError={mfaError}
                    mfaSuccess={mfaSuccess}
                />
                <StaffSecurityCard profile={profile} role={role} />
                <Card title="Staff purchases">
                    <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.55, margin: '0 0 14px' }}>
                        Billing and subscriptions are for customer accounts. Staff can buy products separately with an employee discount.
                    </p>
                    <Link to="/staff/shop" style={{ color: theme.accent, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                        Open Staff Store →
                    </Link>
                </Card>
                <PasswordCard
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    passwordSaving={passwordSaving}
                    passwordSuccess={passwordSuccess}
                    onSubmit={handlePasswordChange}
                />
            </div>
        </>
    );
}