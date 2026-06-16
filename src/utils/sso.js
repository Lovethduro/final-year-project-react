import { completeOAuthLogin } from './oauthApi';
import { loginWithGoogle } from './googleAuth';

export async function signInWithGoogle(role, rememberMe = false) {
    const accessToken = await loginWithGoogle();
    return completeOAuthLogin('google', accessToken, role || null, rememberMe);
}

export async function signInWithMicrosoft(role, rememberMe = false) {
    const { loginWithMicrosoft } = await import('./microsoftAuth');
    const accessToken = await loginWithMicrosoft();
    return completeOAuthLogin('microsoft', accessToken, role || null, rememberMe);
}
