import { API_BASE, getPostAuthPath, storeAuthSession } from './authFlow';

export async function completeOAuthLogin(provider, token, role) {
    const endpoint = provider === 'google' ? '/oauth/google' : '/oauth/microsoft';

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `${provider} sign-in failed`);
    }

    storeAuthSession(data);
    return {
        data,
        nextPath: getPostAuthPath(data),
    };
}
