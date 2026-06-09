import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID || '',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
    },
};

let msalInstance;

async function getMsalInstance() {
    if (!process.env.REACT_APP_MICROSOFT_CLIENT_ID) {
        throw new Error('Microsoft sign-in is not configured. Add REACT_APP_MICROSOFT_CLIENT_ID to your .env file.');
    }

    if (!msalInstance) {
        msalInstance = new PublicClientApplication(msalConfig);
        await msalInstance.initialize();
    }

    return msalInstance;
}

export async function loginWithMicrosoft() {
    const instance = await getMsalInstance();
    const result = await instance.loginPopup({
        scopes: ['User.Read'],
    });

    if (!result?.accessToken) {
        throw new Error('Microsoft sign-in did not return an access token');
    }

    return result.accessToken;
}
