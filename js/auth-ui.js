"use strict";

const signInButton = document.querySelector("#googleSignInButton");
const signOutButton = document.querySelector("#signOutButton");
const accountName = document.querySelector("#accountName");
const authStatus = document.querySelector("#authStatus");
const accountIdentity = document.querySelector("#accountIdentity");
const accountAvatar = document.querySelector("#accountAvatar");
const accountAvatarFallback =
    document.querySelector("#accountAvatarFallback");
const profileButton = document.querySelector("#profileButton");
const profileCloseButton =
    document.querySelector("#profileCloseButton");
const profileSection = document.querySelector("#profileSection");
const profileAvatar = document.querySelector("#profileAvatar");
const profileAvatarFallback =
    document.querySelector("#profileAvatarFallback");
const profileDisplayName =
    document.querySelector("#profileDisplayName");
const profileEpicName =
    document.querySelector("#profileEpicName");
const profileBio =
    document.querySelector("#profileBio");
const profileJoinDate =
    document.querySelector("#profileJoinDate");
const profileSaveButton =
    document.querySelector("#profileSaveButton");
const profileStatus = document.querySelector("#profileStatus");

let loadedProfileName = "";
let loadedProfileEpicName = "";
let loadedProfileBio = "";

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

            if (user) {
                void loadHeaderProfileName(user);
            }

            profileButton.hidden = !user;

            if (!user) {
                profileSection.hidden = true;
            }

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

        async function loadHeaderProfileName(user) {
            const { data: profile, error: profileError } =
                await authClient
                    .from("profiles")
                    .select("display_name")
                    .eq("id", user.id)
                    .single();

            if (profileError || !profile) {
                return;
            }

            const savedDisplayName =
                typeof profile.display_name === "string"
                    ? profile.display_name.trim()
                    : "";

            if (!savedDisplayName) {
                return;
            }

            accountName.textContent = savedDisplayName;

            accountAvatarFallback.textContent =
                savedDisplayName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(part => Array.from(part)[0])
                    .join("")
                    .toUpperCase();
        }

        async function loadProfile() {
            profileStatus.textContent = "Loading profile...";

            const { data: userData, error: userError } =
                await authClient.auth.getUser();

            if (userError || !userData.user) {
                profileStatus.textContent =
                    "Unable to load your profile.";
                return;
            }

            const { data: profile, error: profileError } =
                await authClient
                    .from("profiles")
                    .select(
                        "display_name, avatar_url, bio, epic_display_name, created_at"
                    )
                    .eq("id", userData.user.id)
                    .single();

            if (profileError || !profile) {
                profileStatus.textContent =
                    "Unable to load your profile.";
                return;
            }

            profileDisplayName.value =
                profile.display_name || "";

            profileEpicName.value =
                profile.epic_display_name || "";

            profileBio.value =
                profile.bio || "";

            loadedProfileName =
                profileDisplayName.value.trim();

            loadedProfileEpicName =
                profileEpicName.value.trim();

            loadedProfileBio =
                profileBio.value.trim();

            if (profile.created_at) {
                const joinedDate =
                    new Date(profile.created_at);

                profileJoinDate.textContent =
                    `Joined ${joinedDate.toLocaleDateString(
                        undefined,
                        {
                            year: "numeric",
                            month: "long"
                        }
                    )}`;
            } else {
                profileJoinDate.textContent =
                    "Joined —";
            }

            profileSaveButton.disabled = true;

            profileAvatarFallback.textContent =
                profile.display_name
                    ? profile.display_name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map(part => Array.from(part)[0])
                        .join("")
                        .toUpperCase()
                    : "?";

            const pictureUrl =
                typeof profile.avatar_url === "string"
                    ? profile.avatar_url
                    : "";

            if (pictureUrl) {
                profileAvatar.hidden = true;
                profileAvatarFallback.hidden = false;
                profileAvatar.src = pictureUrl;
            } else {
                profileAvatar.hidden = true;
                profileAvatarFallback.hidden = false;
                profileAvatar.removeAttribute("src");
            }

            profileStatus.textContent = "";
        }

        async function saveProfile() {
            const displayName =
                profileDisplayName.value.trim();

            const epicDisplayName =
                profileEpicName.value.trim();

            const bio =
                profileBio.value.trim();

            if (!displayName) {
                profileStatus.textContent =
                    "Please enter a display name.";
                return;
            }

            profileSaveButton.disabled = true;
            profileStatus.textContent = "Saving profile...";

            try {
                const { data: userData, error: userError } =
                    await authClient.auth.getUser();

                if (userError || !userData.user) {
                    profileStatus.textContent =
                        "Unable to verify your account.";
                    return;
                }

                const { error: profileError } =
                    await authClient
                        .from("profiles")
                        .update({
                            display_name: displayName,
                            epic_display_name: epicDisplayName || null,
                            bio: bio || null,
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", userData.user.id);

                if (profileError) {
                    console.error(profileError);

                    profileStatus.textContent =
                        "Unable to save your profile.";
                    return;
                }

                accountName.textContent = displayName;

                profileAvatarFallback.textContent =
                    displayName
                        .split(/\s+/)
                        .slice(0, 2)
                        .map(part => Array.from(part)[0])
                        .join("")
                        .toUpperCase();

                profileStatus.textContent =
                    "Profile saved.";
                loadedProfileName = displayName;
                loadedProfileEpicName = epicDisplayName;
                loadedProfileBio = bio;

            } finally {
                const currentName =
                    profileDisplayName.value.trim();

                const currentEpicName =
                    profileEpicName.value.trim();

                const currentBio =
                    profileBio.value.trim();

                profileSaveButton.disabled =
                    !currentName ||
                    (
                        currentName === loadedProfileName &&
                        currentEpicName === loadedProfileEpicName &&
                        currentBio === loadedProfileBio
                    );
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
            void runAction(signInWithGoogle, "Opening Google sign-in...");
        });

        signOutButton.addEventListener("click", () => {
            void runAction(signOut, "Signing out...");
        });

        profileAvatar.addEventListener("load", () => {
            if (
                !profileSection.hidden &&
                profileAvatar.naturalWidth > 0
            ) {
                profileAvatar.hidden = false;
                profileAvatarFallback.hidden = true;
            }
        });

        profileAvatar.addEventListener("error", () => {
            profileAvatar.hidden = true;
            profileAvatarFallback.hidden = false;
        });

        profileButton.addEventListener("click", () => {
            profileSection.hidden = false;
            profileStatus.textContent = "";

            profileSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            void loadProfile();
        });

        profileCloseButton.addEventListener("click", () => {
            profileSection.hidden = true;
            profileStatus.textContent = "";

            profileButton.focus();
        });

        function updateProfileSaveState() {
            profileStatus.textContent = "";

            const currentName =
                profileDisplayName.value.trim();

            const currentEpicName =
                profileEpicName.value.trim();

            const currentBio =
                profileBio.value.trim();

            profileSaveButton.disabled =
                !currentName ||
                (
                    currentName === loadedProfileName &&
                    currentEpicName === loadedProfileEpicName &&
                    currentBio === loadedProfileBio
                );
        }

        profileDisplayName.addEventListener(
            "input",
            updateProfileSaveState
        );

        profileEpicName.addEventListener(
            "input",
            updateProfileSaveState
        );

        profileBio.addEventListener(
            "input",
            updateProfileSaveState
        );

        function handleProfileEnterSave(event) {
            if (
                event.key === "Enter" &&
                !profileSaveButton.disabled
            ) {
                event.preventDefault();
                void saveProfile();
            }
        }

        profileDisplayName.addEventListener(
            "keydown",
            handleProfileEnterSave
        );

        profileEpicName.addEventListener(
            "keydown",
            handleProfileEnterSave
        );
        profileSaveButton.addEventListener("click", () => {
            void saveProfile();
        });

        signInButton.disabled = false;

    } catch (error) {
        console.error("Auth initialization failed:", error);

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
    accountAvatarFallback &&
    profileButton &&
    profileCloseButton &&
    profileSection &&
    profileAvatar &&
    profileAvatarFallback &&
    profileDisplayName &&
    profileEpicName &&
    profileBio &&
    profileJoinDate &&
    profileSaveButton &&
    profileStatus
) {
    void initializeAuth();
}