import { DashboardLayout } from '../DashboardLayout';
import { PageHeader, Card, PrimaryButton, Select } from '../ui';
import { inputStyle } from '../../styles/theme';
import { formatPaymentMethod } from '../../utils/apiClient';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import {
    labelStyle,
    ProfileAlerts,
    ProfilePhotoCard,
    PreferencesCard,
    PasswordCard,
    CustomerSecurityCard,
} from './profileSections';

export default function CustomerProfileView() {
    const settings = useProfileSettings();
    const {
        profile, form, error, success, saving, uploading,
        passwordForm, setPasswordForm, passwordSaving, passwordSuccess,
        handleChange, handleImageUpload, handleSave, handlePasswordChange, handleMotivationalToggle,
        profileImage,
    } = settings;

    return (
        <DashboardLayout>
            <PageHeader
                title="My Account"
                subtitle="Manage your contact details, billing preferences, and security settings"
            />
            <ProfileAlerts error={error} success={success} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <ProfilePhotoCard
                    profile={profile}
                    profileImage={profileImage}
                    form={form}
                    uploading={uploading}
                    onUpload={handleImageUpload}
                    photoHint="Used on your account and in customer-facing areas. JPG, PNG, WEBP or GIF. Max 5MB."
                />

                <Card title="Contact & Billing">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input value={form.fullName} onChange={handleChange('fullName')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input value={profile?.email || ''} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input value={form.phone} onChange={handleChange('phone')} style={inputStyle} placeholder="+2348012345678" />
                        </div>
                        <div>
                            <label style={labelStyle}>Company</label>
                            <input value={form.companyName} onChange={handleChange('companyName')} style={inputStyle} placeholder="Optional" />
                        </div>
                        <div>
                            <label style={labelStyle}>Account Type</label>
                            <Select value={form.customerType} onChange={handleChange('customerType')}>
                                <option value="individual">Individual</option>
                                <option value="business">Business</option>
                                <option value="enterprise">Enterprise</option>
                            </Select>
                        </div>
                        <div>
                            <label style={labelStyle}>Preferred Payment Method</label>
                            <Select value={form.preferredPaymentMethod} onChange={handleChange('preferredPaymentMethod')}>
                                <option value="paystack">Paystack</option>
                                <option value="flutterwave">Flutterwave</option>
                            </Select>
                        </div>
                        <PrimaryButton onClick={() => handleSave()} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                    </div>
                </Card>

                <PreferencesCard form={form} onMotivationalToggle={handleMotivationalToggle} />
                <CustomerSecurityCard profile={profile} formatPaymentMethod={formatPaymentMethod} />
                <PasswordCard
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    passwordSaving={passwordSaving}
                    passwordSuccess={passwordSuccess}
                    onSubmit={handlePasswordChange}
                />
            </div>
        </DashboardLayout>
    );
}
