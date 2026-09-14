"use strict";

const signInButton = document.querySelector("#googleSignInButton");
const signOutButton = document.querySelector("#signOutButton");
const accountName = document.querySelector("#accountName");
const authStatus = document.querySelector("#authStatus");
const accountIdentity = document.querySelector("#accountIdentity");
const accountAvatar = document.querySelector("#accountAvatar");
const accountAvatarFallback =
    document.querySelector("#accountAvatarFallback");

async function initializeAuth() {
    try {
        const { authClient } = await import("./auth-client.js");
        const { signInWithGoogle, signOut } =
            await import("./auth-actions.js");

        accountAvatar.addEventListener("load", () => {
            if (!accountIdentity.hidden &&
                accountAvatar.naturalWidth > 0) {
                accountAvatar.hidden = false;
                accountAvatarFallback.hidden = true;
            }
        });

        accountAvatar.addEventListener("error", () => {
            accountAvatar.hidden = true;
            accountAvatarFallback.hidden = false;
        });

        function renderSession(session) {
            const user = session?.user;
            const metadata = user?.user_metadata || {};
            const fullName = typeof metadata.full_name === "string"
                ? metadata.full_name.trim()
                : "";
            const displayName = fullName || "Signed in";

            signInButton.hidden = Boolean(user);
            signOutButton.hidden = !user;
            accountIdentity.hidden = !user;
            accountName.hidden = !user;
            accountName.textContent = user ? displayName : "";

            accountAvatarFallback.textContent = fullName
                ? fullName.split(/\s+/)
                    .slice(0, 2)
                    .map(part => Array.from(part)[0])
                    .join("")
                    .toUpperCase()
                : "?";

            let pictureUrl = "";

            if (user) {
                const candidate =
                    metadata.avatar_url || metadata.picture;

                if (typeof candidate === "string") {
                    try {
                        const url = new URL(candidate);

                        if (url.protocol === "https:") {
                            pictureUrl = url.href;
                        }
                    } catch {
                        // Use initials when the picture URL is invalid.
                    }
                }
            }

            if (!pictureUrl) {
                accountAvatar.hidden = true;
                accountAvatarFallback.hidden = false;
                accountAvatar.removeAttribute("src");
                return;
            }

            if (accountAvatar.getAttribute("src") !== pictureUrl) {
                accountAvatar.hidden = true;
                accountAvatarFallback.hidden = false;
                accountAvatar.src = pictureUrl;
            }
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

        let session = data.session;

        if (session) {
            const { data: userData, error: userError } =
                await authClient.auth.getUser();

            if (
                userError?.code === "user_not_found" ||
                (
                    userError?.status === 403 &&
                    userError?.message?.includes(
                        "User from sub claim in JWT does not exist"
                    )
                )
            ) {
                await signOut();
                session = null;
            } else if (userError) {
                throw userError;
            } else if (userData.user) {
                session = {
                    ...session,
                    user: userData.user
                };
            } else {
                throw new Error("Unable to verify account.");
            }
        }

        renderSession(session);

        authClient.auth.onAuthStateChange((_event, session) => {
            renderSession(session);
        });

        async function verifyCurrentUser() {
            const { data: sessionData, error: sessionError } =
                await authClient.auth.getSession();

            if (sessionError) {
                return;
            }

            const currentSession = sessionData.session;

            if (!currentSession) {
                renderSession(null);
                return;
            }

            const { data: userData, error: userError } =
                await authClient.auth.getUser();

            if (
                userError?.code === "user_not_found" ||
                (
                    userError?.status === 403 &&
                    userError?.message?.includes(
                        "User from sub claim in JWT does not exist"
                    )
                )
            ) {
                await signOut();
                renderSession(null);
                return;
            }

            if (userError || !userData.user) {
                return;
            }

            renderSession({
                ...currentSession,
                user: userData.user
            });
        }

        window.addEventListener("focus", () => {
            void verifyCurrentUser();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                void verifyCurrentUser();
            }
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

if (
    signInButton &&
    signOutButton &&
    accountName &&
    authStatus &&
    accountIdentity &&
    accountAvatar &&
    accountAvatarFallback
) {
    void initializeAuth();
}