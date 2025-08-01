import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { fetchAPI } from './fetch';

export const tokenCache = {
    async getToken(key: string) {
        try {
            const item = await SecureStore.getItemAsync(key);
            return item;
        } catch (error) {
            console.error('SecureStore get item error:', error);
            await SecureStore.deleteItemAsync(key);
            return null;
        }
    },
    async saveToken(key: string, value: string) {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (err) {
            console.error('SecureStore set item error:', err);
        }
    },
};

export const googleOAuth = async (startOAuthFlow: any) => {
    try {
        const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow({
            redirectUrl: Linking.createURL('/(authenticated)/(tabs)/home'),
        });

        if (createdSessionId && setActive) {
            await setActive({ session: createdSessionId });

            if (signUp?.createdUserId) {
                const name = `${signUp.firstName || 'User'} ${signUp.lastName || ''}`.trim();
                const email = signUp.emailAddress || 'unknown@example.com';
                await fetchAPI('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        clerkId: signUp.createdUserId,
                    }),
                });
            } else if (signIn?.createdSessionId) {
                await setActive({ session: signIn.createdSessionId });
            }

            return {
                success: true,
                code: 'success',
                message: 'Signed in with Google successfully.',
            };
        }

        return {
            success: false,
            code: 'no_session',
            message: 'Google sign-in failed. No session created.',
        };
    } catch (err: any) {
        console.error('Google OAuth error:', JSON.stringify(err, null, 2));
        return {
            success: false,
            code: err.code || 'unknown',
            message: err?.errors?.[0]?.longMessage || 'Google OAuth failed.',
        };
    }
};

export const appleOAuth = async (startOAuthFlow: any) => {
    try {
        const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow({
            redirectUrl: Linking.createURL('/(authenticated)/(tabs)/home'),
        });

        if (createdSessionId && setActive) {
            await setActive({ session: createdSessionId });

            if (signUp?.createdUserId) {
                const name = `${signUp.firstName || 'User'} ${signUp.lastName || ''}`.trim();
                const email = signUp.emailAddress || 'unknown@example.com';
                await fetchAPI('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        clerkId: signUp.createdUserId,
                    }),
                });
            } else if (signIn?.createdSessionId) {
                await setActive({ session: signIn.createdSessionId });
            }

            return {
                success: true,
                code: 'success',
                message: 'Signed in with Apple successfully.',
            };
        }

        return {
            success: false,
            code: 'no_session',
            message: 'Apple sign-in failed. No session created.',
        };
    } catch (err: any) {
        console.error('Apple OAuth error:', JSON.stringify(err, null, 2));
        return {
            success: false,
            code: err.code || 'unknown',
            message: err?.errors?.[0]?.longMessage || 'Apple OAuth failed.',
        };
    }
};