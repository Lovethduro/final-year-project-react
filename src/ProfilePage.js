import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, Alert, PrimaryButton } from './components/ui';
import { inputStyle } from './styles/theme';
import { getSession, userApi, assetUrl, formatPaymentMethod, getProfileImageUrl } from './utils/apiClient';
import { theme } from './styles/theme';
import { storeAuthSession } from './utils/authFlow';
import { refreshNotifications } from './utils/notifications';

const labelStyle = { display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 };

function syncSessionFromProfile(updated, session) {
    storeAuthSession({
        userId: updated.userId || session.userId,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        mfaEnabled: updated.mfaEnabled,
        emailVerified: updated.emailVerified,
        avatarUrl: getProfileImageUrl(updated),
        preferredPaymentMethod: updated.preferredPaymentMethod,
        createdAt: updated.createdAt,
        token: session.token,
    }, session.rememberMe);
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        companyName: '',
        customerType: 'individual',
        preferredPaymentMethod: 'paystack',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        userApi.getProfile()
            .then((data) => {
                setProfile(data);
                setForm({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    companyName: data.companyName || '',
                    customerType: data.customerType || 'individual',
                    preferredPaymentMethod: data.preferredPaymentMethod || 'paystack',
                });
                const session = getSession();
                syncSessionFromProfile(data, session);
            })
            .catch((err) => setError(err.message));
    }, []);

    const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleImageUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        setError('');
        setSuccess('');
        try {
            const updated = await userApi.uploadAvatar(file);
            setProfile(updated);
            syncSessionFromProfile(updated, getSession());
            setSuccess('Profile photo updated.');
            refreshNotifications();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const updated = await userApi.updateProfile(form);
            setProfile(updated);
            syncSessionFromProfile(updated, getSession());
            setSuccess('Profile updated successfully.');
            refreshNotifications();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const profileImage = getProfileImageUrl(profile);

    return (
        <DashboardLayout>
            <PageHeader title="Profile Settings" subtitle="Manage your personal information and account details" />

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <Card title="Profile Photo">
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                            background: 'rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {profileImage ? (
                                <img src={assetUrl(profileImage)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: 36 }}>👤</span>
                            )}
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: theme.accent, cursor: 'pointer', fontWeight: 600 }}>
                                {uploading ? 'Uploading…' : 'Upload photo'}
                                <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                            </label>
                            <p style={{ fontSize: 12, color: theme.textDim, marginTop: 8, lineHeight: 1.5 }}>
                                One photo is used for your profile and company logo across the app.
                                JPG, PNG, WEBP or GIF. Max 5MB.
                            </p>
                            {profile?.createdAt && (
                                <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 12 }}>
                                    Member since <strong style={{ color: theme.text }}>{profile.createdAt}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Personal Information">
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
                            <input value={form.companyName} onChange={handleChange('companyName')} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Customer Type</label>
                            <select value={form.customerType} onChange={handleChange('customerType')} style={inputStyle}>
                                <option value="individual">Individual</option>
                                <option value="business">Business</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Preferred Payment Method</label>
                            <select value={form.preferredPaymentMethod} onChange={handleChange('preferredPaymentMethod')} style={inputStyle}>
                                <option value="paystack">Paystack</option>
                                <option value="flutterwave">Flutterwave</option>
                            </select>
                        </div>
                        <PrimaryButton onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                    </div>
                </Card>

                <Card title="Security">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Role</span>
                            <strong style={{ color: '#38BDF8' }}>{profile?.role || '—'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Member Since</span>
                            <strong style={{ color: theme.text }}>{profile?.createdAt || '—'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Payment Method</span>
                            <strong style={{ color: theme.accent }}>{formatPaymentMethod(profile?.preferredPaymentMethod)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Email Verified</span>
                            <strong style={{ color: profile?.emailVerified ? '#34D399' : '#FBBF24' }}>
                                {profile?.emailVerified ? 'Yes' : 'No'}
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>MFA Enabled</span>
                            <strong style={{ color: profile?.mfaEnabled ? '#34D399' : '#FBBF24' }}>
                                {profile?.mfaEnabled ? `Yes (${profile?.mfaMethod || 'enabled'})` : 'No'}
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Account Status</span>
                            <strong style={{ color: profile?.active ? '#34D399' : '#EF4444' }}>
                                {profile?.active ? 'Active' : 'Inactive'}
                            </strong>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
