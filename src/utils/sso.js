import { completeOAuthLogin } from './oauthApi';
import { loginWithGoogle } from './googleAuth';

export async function signInWithGoogle(role) {
    const accessToken = await loginWithGoogle();
    return completeOAuthLogin('google', accessToken, role);
}

export async function signInWithMicrosoft(role) {
    const { loginWithMicrosoft } = await import('./microsoftAuth');
    const accessToken = await loginWithMicrosoft();
    return completeOAuthLogin('microsoft', accessToken, role);
}
