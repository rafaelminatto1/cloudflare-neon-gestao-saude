import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react';

// Require the user to set VITE_NEON_AUTH_URL in .env
if (!import.meta.env.VITE_NEON_AUTH_URL) {
    console.warn("VITE_NEON_AUTH_URL is not set. Neon Auth will not work.");
}

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL || "", {
  adapter: BetterAuthReactAdapter(),
});

export const { useSession, signIn, signUp, signOut } = authClient;

// Mocks for compilation
export const getAccessToken = async () => '';
export const getSmsSessionDurationHours = () => 24;
export const requestSmsCode = async (...args: any[]) => {};
export const confirmSmsCode = async (...args: any[]) => {};
export const googleSignIn = async () => {};
export const getAllowedSmsPhoneNumber = () => '+5511999999999';
