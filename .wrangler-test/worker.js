var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// cloudflare/worker.js
var STATUS_KEY = "tng-live-status";
var LIVE_DISCOVERY_INTERVAL_MS = 3e4;
var LIVE_DISCOVERY_MAX_ATTEMPTS = 10;
var YOUTUBE_HANDLE = "@TigerNoslen";
var YOUTUBE_LIVE_URL = "https://www.youtube.com/@TigerNoslen/live";
function corsHeaders(request) {
  const requestOrigin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-TNG-Token",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Vary": requestOrigin ? "Origin" : "Accept-Encoding"
  };
}
__name(corsHeaders, "corsHeaders");
function jsonResponse(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
__name(jsonResponse, "jsonResponse");
function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
__name(wait, "wait");
async function getYouTubeChannelId(apiKey) {
  const endpoint = new URL(
    "https://www.googleapis.com/youtube/v3/channels"
  );
  endpoint.searchParams.set("part", "id");
  endpoint.searchParams.set(
    "forHandle",
    YOUTUBE_HANDLE
  );
  endpoint.searchParams.set("key", apiKey);
  const response = await fetch(endpoint.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `YouTube channel lookup failed: ${response.status} ${errorText}`
    );
  }
  const data = await response.json();
  const channelId = data.items?.[0]?.id;
  if (!channelId) {
    throw new Error(
      `No YouTube channel was found for ${YOUTUBE_HANDLE}.`
    );
  }
  return channelId;
}
__name(getYouTubeChannelId, "getYouTubeChannelId");
async function searchCurrentLiveStream(apiKey, channelId) {
  const endpoint = new URL(
    "https://www.googleapis.com/youtube/v3/search"
  );
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("channelId", channelId);
  endpoint.searchParams.set("eventType", "live");
  endpoint.searchParams.set("type", "video");
  endpoint.searchParams.set("maxResults", "10");
  endpoint.searchParams.set("key", apiKey);
  const response = await fetch(endpoint.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `YouTube live search failed: ${response.status} ${errorText}`
    );
  }
  const data = await response.json();
  console.log(
    "YouTube live search results:",
    data.items || []
  );
  const items = Array.isArray(data.items) ? data.items : [];
  const horizontalItem = items.find((item) => {
    const title = typeof item.snippet?.title === "string" ? item.snippet.title.trim() : "";
    return /^H\s*-\s*/i.test(title);
  });
  const verticalItem = items.find((item) => {
    const title = typeof item.snippet?.title === "string" ? item.snippet.title.trim() : "";
    return !/^H\s*-\s*/i.test(title);
  });
  const primaryItem = horizontalItem || verticalItem;
  if (!primaryItem?.id?.videoId) {
    return null;
  }
  const horizontalTitle = typeof horizontalItem?.snippet?.title === "string" ? horizontalItem.snippet.title.trim().slice(0, 180) : "";
  const verticalTitle = typeof verticalItem?.snippet?.title === "string" ? verticalItem.snippet.title.trim().slice(0, 180) : "";
  return {
    title: horizontalTitle || verticalTitle || "Tiger Noslen is live!",
    verticalTitle,
    videoId: primaryItem.id.videoId,
    streamUrl: horizontalItem?.id?.videoId ? `https://www.youtube.com/watch?v=${horizontalItem.id.videoId}` : "",
    verticalStreamUrl: verticalItem?.id?.videoId ? `https://www.youtube.com/watch?v=${verticalItem.id.videoId}` : "",
    hasHorizontal: Boolean(horizontalItem?.id?.videoId),
    hasVertical: Boolean(verticalItem?.id?.videoId)
  };
}
__name(searchCurrentLiveStream, "searchCurrentLiveStream");
function getVideoIdFromYouTubeUrl(streamUrl) {
  if (typeof streamUrl !== "string" || !streamUrl.trim()) {
    return "";
  }
  try {
    const url = new URL(streamUrl.trim());
    if (url.hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v") || "";
      }
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "live" && parts[1]) {
        return parts[1];
      }
    }
  } catch {
    return "";
  }
  return "";
}
__name(getVideoIdFromYouTubeUrl, "getVideoIdFromYouTubeUrl");
async function findCurrentLiveStream(apiKey) {
  if (!apiKey) {
    throw new Error(
      "The YOUTUBE_API_KEY secret is missing."
    );
  }
  function extractYouTubeVideoId(streamUrl) {
    if (typeof streamUrl !== "string" || !streamUrl.trim()) {
      return "";
    }
    try {
      const parsedUrl = new URL(streamUrl.trim());
      const hostname = parsedUrl.hostname.toLowerCase();
      if (hostname === "youtu.be") {
        return parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
      }
      if (hostname === "youtube.com" || hostname === "www.youtube.com") {
        if (parsedUrl.pathname === "/watch") {
          return parsedUrl.searchParams.get("v") || "";
        }
        const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
        if (pathParts[0] === "live" && pathParts[1]) {
          return pathParts[1];
        }
      }
    } catch {
      return "";
    }
    return "";
  }
  __name(extractYouTubeVideoId, "extractYouTubeVideoId");
  async function getYouTubeVideoLiveState2(apiKey2, videoId) {
    if (!apiKey2 || !videoId) {
      return null;
    }
    const endpoint = new URL(
      "https://www.googleapis.com/youtube/v3/videos"
    );
    endpoint.searchParams.set(
      "part",
      "snippet,liveStreamingDetails"
    );
    endpoint.searchParams.set("id", videoId);
    endpoint.searchParams.set("key", apiKey2);
    const response = await fetch(endpoint.toString());
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `YouTube video status lookup failed: ${response.status} ${errorText}`
      );
    }
    const data = await response.json();
    const video = data.items?.[0];
    if (!video) {
      return null;
    }
    return {
      isLive: video.snippet?.liveBroadcastContent === "live" && !video.liveStreamingDetails?.actualEndTime,
      liveBroadcastContent: video.snippet?.liveBroadcastContent || "",
      actualEndTime: video.liveStreamingDetails?.actualEndTime || ""
    };
  }
  __name(getYouTubeVideoLiveState2, "getYouTubeVideoLiveState");
  const channelId = await getYouTubeChannelId(apiKey);
  const retryDelays = [0, 5e3, 5e3];
  for (const delay of retryDelays) {
    if (delay > 0) {
      await wait(delay);
    }
    const liveStream = await searchCurrentLiveStream(
      apiKey,
      channelId
    );
    if (liveStream) {
      return liveStream;
    }
  }
  return null;
}
__name(findCurrentLiveStream, "findCurrentLiveStream");
async function getYouTubeVideoLiveState(apiKey, videoId) {
  if (!apiKey || !videoId) {
    return null;
  }
  const endpoint = new URL(
    "https://www.googleapis.com/youtube/v3/videos"
  );
  endpoint.searchParams.set(
    "part",
    "snippet,liveStreamingDetails"
  );
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", apiKey);
  const response = await fetch(endpoint.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `YouTube video status lookup failed: ${response.status} ${errorText}`
    );
  }
  const data = await response.json();
  const video = data.items?.[0];
  if (!video) {
    return null;
  }
  return {
    isLive: video.snippet?.liveBroadcastContent === "live" && !video.liveStreamingDetails?.actualEndTime,
    liveBroadcastContent: video.snippet?.liveBroadcastContent || "",
    actualEndTime: video.liveStreamingDetails?.actualEndTime || ""
  };
}
__name(getYouTubeVideoLiveState, "getYouTubeVideoLiveState");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }
    if (url.pathname === "/status" && request.method === "GET") {
      let stored = await env.LIVE_STATUS.get(
        STATUS_KEY,
        "json"
      );
      if (stored?.live === true && (stored.hasHorizontal !== true || stored.hasVertical !== true)) {
        const discoveryAttempts = Number.isFinite(Number(stored.discoveryAttempts)) ? Number(stored.discoveryAttempts) : 0;
        const lastDiscoveryTime = stored.lastDiscoveryAt ? new Date(stored.lastDiscoveryAt).getTime() : 0;
        const discoveryIsDue = !Number.isFinite(lastDiscoveryTime) || Date.now() - lastDiscoveryTime >= LIVE_DISCOVERY_INTERVAL_MS;
        if (discoveryAttempts < LIVE_DISCOVERY_MAX_ATTEMPTS && discoveryIsDue) {
          const discoveryTime = (/* @__PURE__ */ new Date()).toISOString();
          try {
            const youtubeStream = await findCurrentLiveStream(
              env.YOUTUBE_API_KEY
            );
            if (youtubeStream) {
              stored = {
                ...stored,
                title: youtubeStream.title || stored.title || "",
                verticalTitle: youtubeStream.verticalTitle || "",
                streamUrl: youtubeStream.streamUrl || "",
                verticalStreamUrl: youtubeStream.verticalStreamUrl || "",
                hasHorizontal: youtubeStream.hasHorizontal === true,
                hasVertical: youtubeStream.hasVertical === true,
                videoId: youtubeStream.videoId || stored.videoId || "",
                titleSource: "youtube",
                discoveryAttempts: discoveryAttempts + 1,
                lastDiscoveryAt: discoveryTime,
                updatedAt: discoveryTime
              };
            } else {
              stored = {
                ...stored,
                discoveryAttempts: discoveryAttempts + 1,
                lastDiscoveryAt: discoveryTime
              };
            }
            await env.LIVE_STATUS.put(
              STATUS_KEY,
              JSON.stringify(stored)
            );
          } catch (error) {
            console.error(
              "Live stream discovery check failed:",
              error
            );
          }
        }
      }
      if (stored?.live === true) {
        try {
          const horizontalVideoId = getVideoIdFromYouTubeUrl(
            stored.streamUrl
          );
          const verticalVideoId = getVideoIdFromYouTubeUrl(
            stored.verticalStreamUrl
          );
          const horizontalState = horizontalVideoId ? await getYouTubeVideoLiveState(
            env.YOUTUBE_API_KEY,
            horizontalVideoId
          ) : null;
          const verticalState = verticalVideoId ? await getYouTubeVideoLiveState(
            env.YOUTUBE_API_KEY,
            verticalVideoId
          ) : null;
          const horizontalIsLive = horizontalState?.isLive === true;
          const verticalIsLive = verticalState?.isLive === true;
          if (!horizontalIsLive && !verticalIsLive) {
            const youtubeStream = await findCurrentLiveStream(
              env.YOUTUBE_API_KEY
            );
            if (youtubeStream) {
              stored = {
                ...stored,
                live: true,
                title: youtubeStream.title || "Tiger Noslen is live!",
                verticalTitle: youtubeStream.verticalTitle || "",
                streamUrl: youtubeStream.streamUrl || "",
                verticalStreamUrl: youtubeStream.verticalStreamUrl || "",
                hasHorizontal: youtubeStream.hasHorizontal === true,
                hasVertical: youtubeStream.hasVertical === true,
                videoId: youtubeStream.videoId || "",
                titleSource: "youtube",
                discoveryAttempts: 0,
                lastDiscoveryAt: (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              };
            } else {
              stored = {
                ...stored,
                live: false,
                title: "",
                verticalTitle: "",
                streamUrl: "",
                verticalStreamUrl: "",
                hasHorizontal: false,
                hasVertical: false,
                videoId: "",
                titleSource: "auto-offline",
                discoveryAttempts: 0,
                lastDiscoveryAt: null,
                updatedAt: (/* @__PURE__ */ new Date()).toISOString()
              };
            }
          } else {
            stored = {
              ...stored,
              live: true,
              streamUrl: horizontalIsLive ? stored.streamUrl : "",
              verticalStreamUrl: verticalIsLive ? stored.verticalStreamUrl : "",
              hasHorizontal: horizontalIsLive,
              hasVertical: verticalIsLive,
              title: horizontalIsLive ? stored.title : stored.verticalTitle || stored.title || "Tiger Noslen is live!",
              verticalTitle: verticalIsLive ? stored.verticalTitle : "",
              videoId: horizontalIsLive ? horizontalVideoId : verticalIsLive ? verticalVideoId : "",
              titleSource: "youtube",
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
          }
          await env.LIVE_STATUS.put(
            STATUS_KEY,
            JSON.stringify(stored)
          );
        } catch (error) {
          console.error(
            "Automatic live check failed:",
            error
          );
        }
      }
      return jsonResponse(
        request,
        stored ? {
          verticalTitle: "",
          ...stored
        } : {
          live: false,
          title: "",
          verticalTitle: "",
          streamUrl: "",
          verticalStreamUrl: "",
          hasHorizontal: false,
          hasVertical: false,
          videoId: "",
          titleSource: "",
          updatedAt: null
        }
      );
    }
    if (url.pathname === "/refresh" && request.method === "POST") {
      const suppliedToken = request.headers.get("X-TNG-Token");
      if (!suppliedToken || suppliedToken !== env.UPDATE_TOKEN) {
        return jsonResponse(
          request,
          { error: "Unauthorized" },
          401
        );
      }
      try {
        const youtubeStream = await findCurrentLiveStream(
          env.YOUTUBE_API_KEY
        );
        const refreshedAt = (/* @__PURE__ */ new Date()).toISOString();
        const nextStatus = youtubeStream ? {
          live: true,
          title: youtubeStream.title || "Tiger Noslen is live!",
          verticalTitle: youtubeStream.verticalTitle || "",
          streamUrl: youtubeStream.streamUrl || "",
          verticalStreamUrl: youtubeStream.verticalStreamUrl || "",
          hasHorizontal: youtubeStream.hasHorizontal === true,
          hasVertical: youtubeStream.hasVertical === true,
          videoId: youtubeStream.videoId || "",
          titleSource: "youtube",
          discoveryAttempts: 0,
          lastDiscoveryAt: refreshedAt,
          updatedAt: refreshedAt
        } : {
          live: false,
          title: "",
          verticalTitle: "",
          streamUrl: "",
          verticalStreamUrl: "",
          hasHorizontal: false,
          hasVertical: false,
          videoId: "",
          titleSource: "auto-offline",
          discoveryAttempts: 0,
          lastDiscoveryAt: null,
          updatedAt: refreshedAt
        };
        await env.LIVE_STATUS.put(
          STATUS_KEY,
          JSON.stringify(nextStatus)
        );
        return jsonResponse(
          request,
          {
            ok: true,
            status: nextStatus
          }
        );
      } catch (error) {
        console.error(
          "Refresh failed:",
          error
        );
        return jsonResponse(
          request,
          {
            error: "Refresh failed"
          },
          500
        );
      }
    }
    if (url.pathname === "/update" && request.method === "POST") {
      const suppliedToken = request.headers.get("X-TNG-Token");
      if (!suppliedToken || suppliedToken !== env.UPDATE_TOKEN) {
        return jsonResponse(
          request,
          { error: "Unauthorized" },
          401
        );
      }
      let payload;
      try {
        payload = await request.json();
        console.log("Incoming payload:", payload);
      } catch {
        return jsonResponse(
          request,
          { error: "Invalid JSON" },
          400
        );
      }
      const isLive = payload.live === true;
      let title = "";
      let verticalTitle = "";
      let streamUrl = "";
      let verticalStreamUrl = "";
      let videoId = "";
      let hasHorizontal = false;
      let hasVertical = false;
      let titleSource = "";
      if (isLive) {
        if (typeof payload.verticalStreamUrl === "string" && payload.verticalStreamUrl.trim()) {
          try {
            const suppliedVerticalUrl = new URL(
              payload.verticalStreamUrl.trim()
            );
            const allowedYouTubeHosts = /* @__PURE__ */ new Set([
              "youtube.com",
              "www.youtube.com",
              "youtu.be"
            ]);
            if (suppliedVerticalUrl.protocol === "https:" && allowedYouTubeHosts.has(
              suppliedVerticalUrl.hostname.toLowerCase()
            )) {
              verticalStreamUrl = suppliedVerticalUrl.toString();
              hasVertical = true;
            }
          } catch {
            console.warn(
              "Ignoring invalid vertical stream URL."
            );
          }
        }
        title = typeof payload.title === "string" && payload.title.trim() ? payload.title.trim().slice(0, 180) : "Tiger Noslen is live!";
        streamUrl = YOUTUBE_LIVE_URL;
        titleSource = "fallback";
        try {
          const youtubeStream = await findCurrentLiveStream(
            env.YOUTUBE_API_KEY
          );
          if (youtubeStream) {
            title = youtubeStream.title;
            verticalTitle = youtubeStream.verticalTitle || "";
            streamUrl = youtubeStream.streamUrl || "";
            verticalStreamUrl = youtubeStream.verticalStreamUrl || "";
            videoId = youtubeStream.videoId;
            hasHorizontal = youtubeStream.hasHorizontal === true;
            hasVertical = youtubeStream.hasVertical === true;
            titleSource = "youtube";
          }
        } catch (error) {
          console.error(
            "YouTube lookup error:",
            error
          );
        }
      }
      const nextStatus = {
        live: isLive,
        title: isLive ? title : "",
        verticalTitle: isLive && hasVertical ? verticalTitle : "",
        streamUrl: isLive && hasHorizontal ? streamUrl : "",
        verticalStreamUrl: isLive && hasVertical ? verticalStreamUrl : "",
        hasHorizontal: isLive && hasHorizontal,
        hasVertical: isLive && hasVertical,
        videoId: isLive ? videoId : "",
        titleSource: isLive ? titleSource : "",
        discoveryAttempts: 0,
        lastDiscoveryAt: isLive ? (/* @__PURE__ */ new Date()).toISOString() : null,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
