import { useEffect, useState } from 'react';
import { getSession, userApi, authApi, getProfileImageUrl } from '../utils/apiClient';
import { storeAuthSession } from '../utils/authFlow';
import { refreshNotifications } from '../utils/notifications';

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
        mustChangePassword: updated.mustChangePassword,
        showMotivationalMessages: updated.showMotivationalMessages !== false,
    }, session.rememberMe);
}

export function useProfileSettings() {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        companyName: '',
        customerType: 'individual',
        preferredPaymentMethod: 'paystack',
        showMotivationalMessages: true,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [disablingMfa, setDisablingMfa] = useState(false);
    const [mfaError, setMfaError] = useState('');
    const [mfaSuccess, setMfaSuccess] = useState('');

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
                    showMotivationalMessages: data.showMotivationalMessages !== false,
                });
                syncSessionFromProfile(data, getSession());
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

    const handleSave = async (payload) => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const updated = await userApi.updateProfile(payload ?? {
                ...form,
                showMotivationalMessages: form.showMotivationalMessages,
            });
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

    const handlePasswordChange = async () => {
        setPasswordSaving(true);
        setError('');
        setPasswordSuccess('');
        if (passwordForm.newPassword.length < 8) {
            setError('New password must be at least 8 characters.');
            setPasswordSaving(false);
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match.');
            setPasswordSaving(false);
            return;
        }
        try {
            await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordSuccess('Password updated successfully.');
            const session = getSession();
            storeAuthSession({ ...session, mustChangePassword: false }, session.rememberMe);
        } catch (err) {
            setError(err.message);
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleMotivationalToggle = async (enabled) => {
        setError('');
        setSuccess('');
        const next = { ...form, showMotivationalMessages: enabled };
        setForm(next);
        try {
            const updated = await userApi.updateProfile({ showMotivationalMessages: enabled });
            setProfile(updated);
            syncSessionFromProfile(updated, getSession());
            setSuccess(enabled ? 'Motivational messages turned on.' : 'Motivational messages turned off.');
        } catch (err) {
            setError(err.message);
            setForm((prev) => ({ ...prev, showMotivationalMessages: !enabled }));
        }
    };

    const handleDisableMfa = async (payload) => {
        setDisablingMfa(true);
        setMfaError('');
        setMfaSuccess('');
        try {
            await userApi.disableMfa(payload);
            const updated = await userApi.getProfile();
            setProfile(updated);
            syncSessionFromProfile(updated, getSession());
            setMfaSuccess('MFA has been disabled.');
            return true;
        } catch (err) {
            setMfaError(err.message);
            return false;
        } finally {
            setDisablingMfa(false);
        }
    };

    const prepareDisableMfa = async () => {
        setMfaError('');
        try {
            await userApi.prepareDisableMfa();
            return true;
        } catch (err) {
            setMfaError(err.message);
            return false;
        }
    };

    return {
        profile,
        form,
        error,
        success,
        saving,
        uploading,
        passwordForm,
        setPasswordForm,
        passwordSaving,
        passwordSuccess,
        handleChange,
        handleImageUpload,
        handleSave,
        handlePasswordChange,
        handleMotivationalToggle,
        handleDisableMfa,
        prepareDisableMfa,
        disablingMfa,
        mfaError,
        mfaSuccess,
        profileImage: getProfileImageUrl(profile),
    };
}
