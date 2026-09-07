"use strict";

import { authClient } from "./auth-client.js";
import { AUTH_CONFIG } from "./auth-config.js";

export async function signInWithGoogle() {
    const { error } = await authClient.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: AUTH_CONFIG.redirectUrl
        }
    });

    if (error) {
        throw error;
    }
}

export async function signOut() {
    const { error } = await authClient.auth.signOut({
        scope: "local"
    });

    if (error) {
        throw error;
    }
}