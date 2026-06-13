# Pinterest API — Standard Access Demo Video

Script + shot list for the app-review video. Goal: get **Standard access** so the
engine can publish pins automatically.

## Why v1 was rejected (the real reason)

Pinterest's reviewer needs to SEE two specific things on screen:

1. **The Pinterest consent screen** — the page on pinterest.com where you click
   "Allow" / "Give access" and the requested scopes are listed.
2. **A real API call** — the app actually hitting the `v5/pins` endpoint and getting
   a success response back.

In v1, the narration *describes* both of these, but the footage underneath is
**VS Code the entire time** (scrolling through code + running the CSV generator).
The consent screen and the API call are never actually shown. That triggers
Pinterest's two stock rejection messages:

- "Demo did not show the full OAuth flow"
- "Demo did not show Pinterest API integration"

Sandbox is fine for the recording (Pinterest says so explicitly). A terminal
recording of the API call is also fine. We just have to actually show them.

---

## The narration you already recorded (clean, in timeline order)

This is the de-stumbled audio that's already on your CapCut timeline (the retakes
like "This is the auth server" ×3 are already cut out). ~2:19 total.

| # | ~Time | Spoken line | What MUST be on screen |
|---|-------|-------------|------------------------|
| 1 | 0:00–0:19 | "Hi, this is a demo of MeetBackdrops Engine, an internal tool I built to publish my own original virtual-background images to Pinterest using their official v5 API. In this video I'll walk through the full OAuth 2.0 authorization-code flow and a real call to the v5 pins endpoint." | Title card or your editor — **fine as-is** |
| 2 | 0:19–0:21 | "This is the auth server." | `oauth-server.js` open in editor — **fine as-is** |
| 3 | 0:21–0:43 | "It builds an authorize URL pointing to pinterest.com/oauth. Then on the callback it exchanges the authorization code for an access token by posting to `api.pinterest.com /v5/oauth/token` with HTTP basic authentication." | `oauth-server.js` (the buildAuthorizeUrl + exchangeCodeForToken functions) — **fine as-is** |
| 4 | 0:43–0:49 | "I'm starting the auth server now." | **NEW:** terminal running `node pinterest-engine/oauth-server.js`, showing the "listening on localhost:8080" banner |
| 5 | 0:49–0:55 | "It's listening on localhost port 8080. Let me open in the browser." | **NEW:** browser at `http://localhost:8080`, the "Authorize with Pinterest" page |
| 6 | 0:55–1:34 | "Clicking authorize redirects me to the Pinterest consent screen with the requested scopes — pins read, pins write, boards read, and user accounts read. Pinterest redirects back to the registered callback URL with an authorization code. The server exchanges that code for an access token using the client credentials and writes the token to the local environment file. The token is now ready to use for API requests. This is the publisher module — it sends a POST to `api.pinterest.com/v5/pins` with the access token in the Authorization header as a bearer token. All content is original, generated from my own image manifest." | **NEW & CRITICAL:** the actual **Pinterest consent screen** (scopes visible) → click Allow → the success page showing the token was written. Then cut to `publisher.js` for the last sentence. |
| 7 | 1:34–1:43 | "Each pin is generated deterministically from this manifest of images that I own." | `final_manifest.json` open — **fine as-is** |
| 8 | 1:43–1:46 | "Now I'll publish one pin to Pinterest." | **NEW:** terminal, about to run the publish command |
| 9 | 1:46–1:57 | "This CLI prints the full request payload first — board ID, title, description, image URL, and destination link — then calls the v5 pins endpoint." | **NEW:** terminal showing the `=== REQUEST ===` block printed by `cli.js publish-one` |
| 10 | 1:57–2:04 | *(see note)* "The v5 pins endpoint returns the new pin's ID, confirming the pin was created." | **NEW:** terminal showing the `=== RESPONSE === status: OK / pin_id: …` block |
| 11 | 2:04–2:08 | "The integration is working end-to-end: auth, token exchange, and the v5 pins API." | terminal response still up — **fine** |
| 12 | 2:08–2:19 | "That's the full flow: OAuth 2.0 authorization-code grant, token exchange, and a verified call to the v5 pins endpoint. The tool only publishes my own original content. Thanks." | Recap card / editor. **Note: video currently goes black here — clip 10 ends at 2:03 but audio runs to 2:19. Fill this 16 s.** |

### One line to re-record (line 10)

Your recorded line 10 is *"Here's the pin live on Pinterest posted to the corresponding board."*
In **sandbox**, the pin is **not** visible on pinterest.com — so that sentence
contradicts what's on screen (a JSON response). Re-record it as:

> "The v5 pins endpoint returns the new pin's ID, confirming the pin was created."

It's one 6-second line. Everything else in your narration is good.

---

## The new footage to record (≈ 45 seconds total)

Everything is already configured in `.env.local` (client id/secret, redirect URI,
tokens, board IDs), so this just runs. Record ONE clean screen capture of:

1. **Terminal:** `node pinterest-engine/oauth-server.js` → shows the localhost:8080 banner.
2. **Browser:** open `http://localhost:8080` → click **Authorize with Pinterest**.
3. **Pinterest consent screen:** let the scopes be clearly visible for ~3 s → click **Allow**.
   - If Pinterest skips the consent screen (because you're already authorized), first
     revoke access at pinterest.com → Settings → Apps, then re-run. That guarantees a
     clean consent screen for the reviewer.
4. **Success page:** the "Authorization successful / token written" page.
5. **Terminal:** `node pinterest-engine/cli.js publish-one <slug>` → shows the
   `=== REQUEST ===` payload, then `=== RESPONSE === status: OK / pin_id: …`.

That's it. Drop those clips over narration lines 4–6 and 8–10, keep your existing
code B-roll for the rest, fill the 16 s tail, and it's an approvable cut.
