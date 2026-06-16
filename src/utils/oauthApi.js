import { API_BASE, getPostAuthPath, storeAuthSession } from './authFlow';

export async function completeOAuthLogin(provider, token, role, rememberMe = false) {
    const endpoint = provider === 'google' ? '/oauth/google' : '/oauth/microsoft';

    const payload = { token };
    if (role) {
        payload.role = role;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `${provider} sign-in failed`);
    }

    if (data.mfaRequired) {
        return { mfaRequired: true, data };
    }

    storeAuthSession(data, rememberMe);
    return {
        data,
        nextPath: getPostAuthPath(data),
    };
}
