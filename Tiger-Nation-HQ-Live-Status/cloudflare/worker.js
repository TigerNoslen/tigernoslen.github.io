/**
 * Tiger Nation HQ — Live Status Worker
 *
 * Cloudflare bindings:
 *   KV namespace binding: LIVE_STATUS
 *
 * Secret:
 *   UPDATE_TOKEN = a long random password
 */

const STATUS_KEY = "tng-live-status";

function corsHeaders(request) {
    const requestOrigin = request.headers.get("Origin");

    /*
     * During setup, "*" permits GitHub Pages and local testing.
     * Later, replace "*" with your exact website origin for tighter security.
     */
    const allowedOrigin = "*";

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-TNG-Token",
        "Access-Control-Max-Age": "86400",
        "Cache-Control": "no-store",
        "Vary": requestOrigin ? "Origin" : "Accept-Encoding"
    };
}

function jsonResponse(request, body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders(request),
            "Content-Type": "application/json; charset=utf-8"
        }
    });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(request)
            });
        }

        if (url.pathname === "/status" && request.method === "GET") {
            const stored = await env.LIVE_STATUS.get(
                STATUS_KEY,
                "json"
            );

            return jsonResponse(
                request,
                stored || {
                    live: false,
                    title: "",
                    streamUrl:
                        "https://www.youtube.com/@TigerNoslen",
                    updatedAt: null
                }
            );
        }

        if (url.pathname === "/update" && request.method === "POST") {
            const suppliedToken =
                request.headers.get("X-TNG-Token");

            if (
                !suppliedToken ||
                suppliedToken !== env.UPDATE_TOKEN
            ) {
                return jsonResponse(
                    request,
                    { error: "Unauthorized" },
                    401
                );
            }

            let payload;

            try {
                payload = await request.json();
            } catch {
                return jsonResponse(
                    request,
                    { error: "Invalid JSON" },
                    400
                );
            }

            const nextStatus = {
                live: payload.live === true,
                title:
                    typeof payload.title === "string"
                        ? payload.title.slice(0, 180)
                        : "",
                streamUrl:
                    typeof payload.streamUrl === "string" &&
                    payload.streamUrl.startsWith("https://")
                        ? payload.streamUrl
                        : "https://www.youtube.com/@TigerNoslen",
                updatedAt: new Date().toISOString()
            };

            await env.LIVE_STATUS.put(
                STATUS_KEY,
                JSON.stringify(nextStatus)
            );

            return jsonResponse(request, {
                ok: true,
                status: nextStatus
            });
        }

        return jsonResponse(
            request,
            { error: "Not found" },
            404
        );
    }
};
