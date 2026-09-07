"use strict";

import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

import { AUTH_CONFIG } from "./auth-config.js";

export const authClient = createClient(
    AUTH_CONFIG.supabaseUrl,
    AUTH_CONFIG.supabasePublishableKey,
    {
        auth: {
            storage: window.localStorage,
            flowType: "pkce",
            detectSessionInUrl: true,
            persistSession: true,
            autoRefreshToken: true
        }
    }
);