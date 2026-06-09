const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export function isGoogleAuthConfigured() {
    return Boolean(GOOGLE_CLIENT_ID);
}

function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.oauth2) {
            resolve();
            return;
        }

        const existing = document.getElementById('google-gsi-script');
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Failed to load Google sign-in')));
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google sign-in'));
        document.head.appendChild(script);
    });
}

export async function loginWithGoogle() {
    if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google sign-in is not configured. Add REACT_APP_GOOGLE_CLIENT_ID to your .env file.');
    }

    await loadGoogleScript();

    return new Promise((resolve, reject) => {
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'openid email profile',
                callback: (response) => {
                    if (response?.access_token) {
                        resolve(response.access_token);
                    } else {
                        reject(new Error('Google sign-in did not return a token.'));
                    }
                },
                error_callback: (error) => {
                    reject(new Error(error?.message || 'Google sign-in was cancelled or failed.'));
                },
            });

            client.requestAccessToken({ prompt: 'select_account' });
        } catch (error) {
            reject(error);
        }
    });
}
