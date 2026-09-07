"use strict";

const signInButton = document.querySelector("#googleSignInButton");
const signOutButton = document.querySelector("#signOutButton");
const accountName = document.querySelector("#accountName");
const authStatus = document.querySelector("#authStatus");

async function initializeAuth() {
    try {
        const { authClient } = await import("./auth-client.js");
        const { signInWithGoogle, signOut } =
            await import("./auth-actions.js");

        function renderSession(session) {
            const user = session?.user;

            signInButton.hidden = Boolean(user);
            signOutButton.hidden = !user;
            accountName.hidden = !user;

            accountName.textContent = user
                ? user.user_metadata?.full_name || "Signed in"
                : "";
        }

        async function runAction(action, message) {
            signInButton.disabled = true;
            signOutButton.disabled = true;
            authStatus.textContent = message;

            try {
                await action();
                authStatus.textContent = "";
            } catch {
                authStatus.textContent =
                    "Unable to complete that action. Please try again.";
            } finally {
                signInButton.disabled = false;
                signOutButton.disabled = false;
            }
        }

        const { data, error } = await authClient.auth.getSession();

        if (error) {
            throw error;
        }

        renderSession(data.session);

        authClient.auth.onAuthStateChange((_event, session) => {
            renderSession(session);
        });

        signInButton.addEventListener("click", () => {
            void runAction(signInWithGoogle, "Opening Google sign-in…");
        });

        signOutButton.addEventListener("click", () => {
            void runAction(signOut, "Signing out…");
        });

        signInButton.disabled = false;
    } catch {
        authStatus.textContent =
            "Sign-in is unavailable. Please refresh to try again.";
    }
}

if (signInButton && signOutButton && accountName && authStatus) {
    void initializeAuth();
}