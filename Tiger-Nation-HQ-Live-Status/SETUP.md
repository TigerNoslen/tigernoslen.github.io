# Tiger Nation HQ — OBS / Streamer.bot Live Status Setup

This package contains the website-side live/offline display, a Cloudflare Worker,
and two Streamer.bot C# actions.

## Files

- `website/index.html`
- `website/css/style.css`
- `website/js/script.js`
- `cloudflare/worker.js`
- `streamerbot/tng-live.cs`
- `streamerbot/tng-offline.cs`

## How it works

1. OBS begins or ends streaming.
2. Streamer.bot fires its OBS Streaming Started or Streaming Stopped trigger.
3. The matching C# action sends a secure POST request to Cloudflare.
4. Cloudflare stores the current state in Workers KV.
5. Tiger Nation HQ checks the public `/status` endpoint every 15 seconds.
6. The navigation and hero update to LIVE or OFFLINE.

## Part 1 — Test the website before Cloudflare

Replace your current files with the files inside `website`.

Open either test URL:

- `index.html?liveTest=live`
- `index.html?liveTest=offline`

On GitHub Pages, add the same query string to the published URL.

The test mode overrides the remote endpoint and lets you preview both states.

## Part 2 — Create the Cloudflare Worker

1. Create or sign in to a Cloudflare account.
2. Open **Workers & Pages**.
3. Create a Worker.
4. Replace its starter code with `cloudflare/worker.js`.
5. Create a Workers KV namespace.
6. Bind that namespace to the Worker using the variable name:

   `LIVE_STATUS`

7. Add a Worker secret named:

   `UPDATE_TOKEN`

8. Give it a long random value. Do not put this secret in the website files.
9. Deploy the Worker.
10. Copy its public workers.dev URL.

Your endpoints will be:

- Public read: `https://YOUR-WORKER.workers.dev/status`
- Protected update: `https://YOUR-WORKER.workers.dev/update`

## Part 3 — Connect the website

Open `website/js/script.js`.

Find:

`endpoint: "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/status"`

Replace it with your real `/status` URL.

Commit and publish the website files.

## Part 4 — Create the Streamer.bot actions

Create two actions:

### TNG Website — Live

1. Add an **Execute C# Code** sub-action.
2. Paste `streamerbot/tng-live.cs`.
3. Replace `WorkerUpdateUrl` with your Worker `/update` URL.
4. Replace `UpdateToken` with the exact Cloudflare `UPDATE_TOKEN`.
5. Compile the code.
6. Add the trigger:
   **OBS Studio → Streaming Started**

### TNG Website — Offline

1. Add an **Execute C# Code** sub-action.
2. Paste `streamerbot/tng-offline.cs`.
3. Enter the same Worker URL and token.
4. Compile the code.
5. Add the trigger:
   **OBS Studio → Streaming Stopped**

Use the specific OBS connection that starts your YouTube stream. Avoid choosing
“All/Any” if multiple OBS connections or vertical outputs could fire the event.

## Part 5 — Safe testing

Before relying on the OBS triggers, manually test each Streamer.bot action:

1. Run **TNG Website — Live**.
2. Open the Worker `/status` URL.
3. Confirm `"live": true`.
4. Refresh Tiger Nation HQ and confirm LIVE NOW appears.
5. Run **TNG Website — Offline**.
6. Confirm `"live": false`.
7. Refresh the site and confirm the next scheduled stream appears.

## Notes

- The website never contains the secret.
- Visitors can read the live state but cannot change it without the token.
- The `/status` endpoint disables caching.
- The website refreshes every 15 seconds.
- If the stored update becomes too old, the site shows “Status Unavailable” and
  falls back to the next scheduled stream.
- The next-stream calculation uses the current recurring schedule:
  Monday 5:00 PM ET, Tuesday 5:00 PM ET, Thursday 5:00 PM ET,
  Friday 6:00 PM ET, Saturday 6:30 PM ET.
