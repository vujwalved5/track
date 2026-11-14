# RESEARCH_FOCUS_ROOM.md
_Research date: 2026-11-13. All URLs checked on this date unless stated "UNCONFIRMED"._

---

## 1. One-Page Recommendation

### Timer
Build the timer ourselves — roughly 120 lines of TypeScript in a `usePomodoroTimer` hook. The core idea is **storing `endTimestamp` (a `Date.now()` epoch number) in `localStorage`**, not a countdown tick count. When the tab regains focus, recalculate `endTimestamp - Date.now()` and sync the display instantly. Use a **Web Worker** (`public/timer.worker.js`) to send 1-second pings that bypass Chrome's 1-minute background throttle on main-thread `setInterval`. Show remaining time in the page title so users do not need the tab visible. Fire a Notifications API alert on completion (after user grants permission at Start time). Respect `prefers-reduced-motion` for the arc sweep by switching to a simple text display.

**Do not save sessions to Supabase in Task 17** — it adds network latency and complexity to something that works fine in `localStorage`. Revisit for a potential Task 18 "Focus History" feature.

### Sound
Use **three hybrid tracks**:

| Chip | Recommended approach |
|---|---|
| Rain & Nature | A CC0 OGG file from Freesound (no attribution needed, zero risk). Generate a short pink-noise fallback with Web Audio API. |
| Soft Piano | A CC BY 4.0 OGG from Incompetech (attribution on a Credits modal). The Web Audio API cannot fake a convincing piano — a real recording is required. |
| Deep Focus | A synthesised pink/brown noise blend from Web Audio API (zero licence, no file download, works instantly). Augment with a CC0 ambient drone if needed. |

**Self-host all files in `/public/audio/`.** Vercel CDN is vastly cheaper than Supabase Storage for static audio ($0.01/GB overage vs $0.09/GB). Three OGG files totalling ≤ 3 MB will fit in the Vercel Hobby free tier indefinitely.

**Rule out all three embeds** (Spotify/YouTube/SoundCloud) — they have no reliable autoplay, mandatory visible branding, and their terms forbid building a "streaming service" wrapper.

---

## 2. Pomodoro Timer Reference Table

| Repository | Link | Licence | Last known commit | Timer logic size | Worth reading? |
|---|---|---|---|---|---|
| Siddhesh-Agarwal/Pomofocus | https://github.com/Siddhesh-Agarwal/Pomofocus | MIT | 2023 | ~80 lines React hook, `setInterval` + state | Yes — clean hook pattern, but no Web Worker |
| husseinhareb/Pomotauri | https://github.com/husseinhareb/Pomotauri | MIT | 2024 | Tauri + React, Rust-side timer | Reference only — desktop app, not a web timer |
| bermarte/pomofocus | https://github.com/bermarte/pomofocus | Not specified | 2022 | Vanilla JS, `setInterval`, ~60 lines | No — old, no drift correction |

**Recommendation:** Write our own. The timer hook is ≤ 150 lines. None of the above repositories solve the Web Worker + timestamp approach we need; importing any of them would add dead code and an extra dependency (violating L3).

### A.1 Standard Pomodoro Structure
- **Standard** (Cirillo, 1980s): 25 min focus / 5 min short break / 15–30 min long break after 4 sessions.
  Source: https://todoist.com/productivity-methods/pomodoro-technique (checked 2026-11-13)
- **Variants users expect to customise:** focus duration (default 25), short break (default 5), long break (default 15), sessions before long break (default 4), auto-start breaks, auto-start next focus.
  Source: https://pomofocus.io (settings panel observed 2026-11-13)
- **Common alternative presets:** 15/3 (micro), 50/10 (flow), 90/20 (ultradian rhythm).
  Source: https://tomatoi.st (checked 2026-11-13)

### A.2 Browser Timer Accuracy
**The problem:** `setInterval(fn, 1000)` can drift and is throttled by Chrome/Firefox to ≥ 1 s when a tab is hidden, and further to 1-minute intervals after prolonged background time (Chrome 88+, capped timer chains).
Sources:
- Chrome developer docs on timer throttling: https://developer.chrome.com/blog/background_tabs/ (UNCONFIRMED exact URL — policy confirmed from search results, 2026-11-13)
- MDN Page Visibility API: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API (checked 2026-11-13)

**Recommended approach — three layers:**

1. **Timestamp anchor:** On Start, store `endTimestamp = Date.now() + durationMs` in `localStorage`. Each tick computes `remaining = endTimestamp - Date.now()`. Drift is self-correcting on every tick.
2. **Web Worker pings:** `public/timer.worker.js` runs `setInterval` on a separate thread not subject to main-thread throttling. It `postMessage({ tick: Date.now() })` every 1 000 ms. The main thread receives the message and updates the display. The worker is started on "Start" and terminated on "Reset/Pause".
3. **Page Visibility API:** On `visibilitychange` → `visible`, call `tick()` immediately to snap the display without waiting for the next worker ping.

**Fallback for iOS** (no reliable Worker + background execution): On iOS Safari, once the page is hidden the JS thread is fully suspended. The timestamp approach means the display will snap to the correct remaining time the instant the user returns to the tab, which is the best achievable behaviour without a backend push.

### A.3 Persistence and Sessions
**Across refresh/close:** Store in `localStorage`:
```
mm_focus_endTimestamp   // epoch ms of when current segment ends
mm_focus_mode           // "focus" | "shortBreak" | "longBreak"
mm_focus_sessionCount   // number of focus sessions completed this run
mm_focus_isPaused       // boolean
mm_focus_remainingMs    // remaining ms at time of pause (used when paused)
```
On reload, read these keys. If `endTimestamp` is in the future and not paused, resume automatically.

**Supabase sessions table — proposed but NOT built in Task 17:**

```sql
-- Proposed for a future "Focus History" task only
CREATE TABLE public.focus_sessions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode        text NOT NULL CHECK (mode IN ('focus','shortBreak','longBreak')),
  duration_s  integer NOT NULL,
  completed   boolean NOT NULL DEFAULT false,
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz
);
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
-- RLS: (SELECT auth.uid()) = user_id on all four operations
CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);
```

**Decision for Task 17:** Do not create this table. The Focus Room is a public page (Scoped Exception E1) with no auth requirement. Only a logged-in widget context would justify Supabase sessions. Record the proposal here for the product owner.

### A.4 End-of-Session Alerts
In order of reliability and elegance:

| Method | Support | Notes |
|---|---|---|
| **Page title** `"⏰ 25:00 — Focus Room"` → `"✅ Done!"` | Universal | No permission needed; visible even when tab is not active in taskbar/dock |
| **Short audio chime** (`new Audio('/audio/bell.ogg').play()`) | Universal (needs prior user gesture) | Load lazily; play on session end |
| **Web Notifications API** (`Notification.requestPermission()`) | Chrome, Firefox, Edge; iOS only as installed PWA | Request permission at the moment user clicks Start, not on page load |
| **Screen Wake Lock** (`navigator.wakeLock.request('screen')`) | Chrome 84+, Safari 16.4+ (iOS) | Re-request on `visibilitychange → visible`; silently ignore if denied |

**iOS limits:**
- Web Notifications not available in Safari tab; only available when app is "Add to Home Screen" (PWA, iOS 16.4+). Source: https://pushpad.xyz/blog/safari-web-push (checked 2026-11-13)
- Screen Wake Lock supported since iOS 16.4 but had bugs until iOS 18.4. Source: https://progressier.com (checked 2026-11-13)
- When screen locks on iOS, JS execution pauses; there is no workaround without a backend push notification service (out of scope).

### A.5 Accessibility
- **`aria-live="polite"` strategy:** Keep the visible time display `aria-hidden="true"`. Maintain a visually-hidden `role="status" aria-live="polite" aria-atomic="true"` region. Announce only at meaningful milestones: on Start, at each whole minute, at 30 s, at 10 s, and on completion. Never update it every second.
  Source: MDN ARIA live regions https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live (checked 2026-11-13)
- **Keyboard:** Start / Pause / Reset as real `<button>` elements. Space = Start/Pause (native button behaviour). Pace tabs as `role="tablist"` + `role="tab"` with arrow key navigation.
- **`prefers-reduced-motion` for arc sweep:** When `matchMedia('(prefers-reduced-motion: reduce)').matches`, do not animate `stroke-dashoffset`; instead update it instantly (a jump, not a tween) so the arc still shows the correct remaining fraction. Alternatively, replace the arc entirely with a plain text countdown under reduced-motion.
  Source: MDN prefers-reduced-motion https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion (checked 2026-11-13); WCAG SC 2.3.3 https://www.w3.org/TR/WCAG21/#animation-from-interactions (checked 2026-11-13)

---

## 3. Music Candidate Table

> Checked: 2026-11-13. Format for all UNCONFIRMED fields means the licence page was not directly accessible during this research session.

### Rain & Nature

| # | Name | Source / Link | Licence | Attribution required? | Commercial use | Self-host allowed | Format | Duration | Loops cleanly | Safety rank |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 | "Forest Rainstorm 01" by rifualk | https://freesound.org (search term: Forest Rainstorm rifualk) | **CC0** | No | Yes | Yes | WAV/OGG | ~11 min | Yes (designed for it) | ✅ Safest |
| R2 | "Looping Rain On Skylight Foley Texture" by deadrobotmusic | https://freesound.org (search: Looping Rain Skylight) | **CC0** | No | Yes | Yes | WAV/OGG | UNCONFIRMED | Yes (described as seamless loop) | ✅ Safest |
| R3 | "Rain Loop with Low-Cut Filter" by hargissssound | https://freesound.org (search: Rain Loop Low Cut hargissssound) | **CC0** | No | Yes | Yes | WAV | ~3 min | UNCONFIRMED (professional recording) | ✅ Safest |
| R4 | Web Audio API – Pink Noise synthesis | No file / No external source | **None (code)** | No | Yes | N/A | Generated | Infinite | Perfect (loop = true on buffer) | ✅ Safest |
| R5 | Wikimedia Commons – "Regen im Garten" (Rain in garden) | https://commons.wikimedia.org/wiki/Category:Audio_files_of_rain | **CC0 or PD** (verify per file) | UNCONFIRMED | UNCONFIRMED | UNCONFIRMED | OGG/FLAC | UNCONFIRMED | UNCONFIRMED | ⚠️ Verify per track |

> **Note on Freesound:** Individual sound CC0 files may be freely self-hosted in a website's `/public` folder. The Freesound API itself has non-commercial API terms, but that only applies to programmatic API calls — not to files downloaded manually and self-hosted. Source: https://freesound.org/help/faq/ (checked 2026-11-13)

**Ranked choice: R1 or R2 for the hosted file. R4 (Web Audio pink noise) as the automatic in-browser fallback.**

---

### Soft Piano

| # | Name | Source / Link | Licence | Attribution required? | Attribution text | Commercial use | Self-host allowed | Format | Duration | Loops cleanly | Safety rank |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | "Relaxing Piano Music" – Kevin MacLeod | https://incompetech.com/music/royalty-free/index.html?keywords=relaxing+piano | **CC BY 4.0** | **Yes** | `"Relaxing Piano Music" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 http://creativecommons.org/licenses/by/4.0/` | Yes | Yes (embedded in site, not standalone download) | MP3/OGG | 24:54 | Yes (long-form, clean fade) | ✅ Safe with attribution |
| P2 | "Deep Relaxation" – Kevin MacLeod | https://incompetech.com/music/royalty-free/index.html?keywords=deep+relaxation | **CC BY 4.0** | **Yes** | `"Deep Relaxation" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 http://creativecommons.org/licenses/by/4.0/` | Yes | Yes | MP3/OGG | 51:08 | Yes | ✅ Safe with attribution |
| P3 | "Dreams Become Real" – Kevin MacLeod | https://incompetech.com/music/royalty-free/index.html?keywords=dreams+become+real | **CC BY 4.0** | **Yes** | `"Dreams Become Real" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 http://creativecommons.org/licenses/by/4.0/` | Yes | Yes | MP3/OGG | 6:50 | UNCONFIRMED (short — may need crossfade) | ✅ Safe with attribution |
| P4 | Freesound user "josefpres" – ambient piano loops | https://freesound.org/people/josefpres/ | **CC0** (many, verify per upload) | No (if CC0) | N/A | Yes | Yes | WAV/OGG | Varies | UNCONFIRMED (check individually) | ✅ Safest if CC0 confirmed per track |
| P5 | Freesound user "Erokia" – ambient synth/piano | https://freesound.org/people/Erokia/ | Mix of CC0 and CC BY (varies) | Depends | Per track page | Yes (CC0 and CC BY) | Yes | WAV/OGG | Varies | UNCONFIRMED | ⚠️ Check each track individually |
| P6 | Musopen – public domain piano recordings | https://musopen.org | **Public Domain** (Musopen-funded recordings) | No (PD) | N/A | Yes | Yes | MP3/FLAC | Varies | UNCONFIRMED (may need crossfade editing) | ✅ Safest once verified |

> **Note on Musopen:** Compositions (Bach, Chopin, Satie, etc.) are in the public domain. Musopen funds recordings specifically placed under public domain. Free account has daily download limits; bulk download needs a paid subscription (~\$55/year). Source: https://musopen.org/about/ (checked 2026-11-13)

> **Note on Incompetech attribution:** "No redistribution of raw audio as standalone downloadable" — but embedding in the app as background audio (not as a "download music" feature) is explicitly allowed. Source: https://incompetech.com/music/royalty-free/faq.html (checked 2026-11-13, URL UNCONFIRMED — derived from search result quoting Incompetech FAQ)

**Ranked choice: P4 (CC0 from josefpres on Freesound, verify each track) or P1/P2 (Incompetech CC BY 4.0 with visible credits page).**

---

### Deep Focus

| # | Name | Source / Link | Licence | Attribution required? | Commercial use | Self-host allowed | Format | Duration | Loops cleanly | Safety rank |
|---|---|---|---|---|---|---|---|---|---|---|
| D1 | Web Audio API – Brown/pink noise synthesis | No file | **None (code)** | No | Yes | N/A | Generated | Infinite | Perfect | ✅ Safest |
| D2 | Web Audio API – Low-frequency drone (sine oscillator, slow LFO) | No file | **None (code)** | No | Yes | N/A | Generated | Infinite | Perfect | ✅ Safest |
| D3 | "Deep Relaxation" – Kevin MacLeod | https://incompetech.com | **CC BY 4.0** | Yes | See P2 attribution above | Yes | Yes | MP3/OGG | 51:08 | Yes | ✅ Safe with attribution |
| D4 | Freesound – filtered ambient drone/pad CC0 | https://freesound.org (search: ambient drone pad CC0) | **CC0** | No | Yes | Yes | WAV/OGG | Varies | UNCONFIRMED | ✅ Safest once verified |
| D5 | Pixabay – ambient focus music | https://pixabay.com/music/ | **Pixabay Content Licence** | No | Yes | Yes (embedded in site) | MP3 | Varies | UNCONFIRMED | ✅ Safe (but risk of Content ID on YouTube re-uploads) |

> **Note on Pixabay:** No attribution required; commercial use allowed; self-hosting allowed when embedded in a project (not as standalone downloadable). Some tracks registered with Content ID — keep licence proof. Source: https://pixabay.com/service/license-summary/ (checked 2026-11-13)

**Ranked choice: D1/D2 (synthesised, zero risk) for primary. D3 or D4 as an optional upgrade.**

---

### Web Audio API Synthesis — Capability Assessment

**Can do:**
- White noise (flat spectrum hiss)
- Pink noise (equal energy per octave — sounds like rainfall/waterfall, very usable for Rain & Nature chip)
- Brown/red noise (deep rumble, -6 dB/octave — good "Deep Focus" drone)
- Sine/square oscillator drones with slow LFO modulation (meditative hum)
- Filter sweeps (BiquadFilter cutoff automation — creates subtle evolution in texture)
- Fade in/out (GainNode ramp)
- Volume control (GainNode.gain.value)

**Cannot do:**
- Convincing acoustic instruments (piano, strings, rain with realistic spatial character)
- Complex musical phrases or melodies
- Nature sound fields (birds, specific room acoustics)

**Conclusion:** Synthesis is excellent for Deep Focus and an acceptable Rain fallback, but cannot replace a good piano recording. Hybrid approach is optimal.

---

## 4. Proposed Technical Design

### Timer

```
[usePomodoroTimer hook]
  State: mode (focus|shortBreak|longBreak), remaining (seconds),
         isRunning, sessionCount
  On Start:
    - Compute endTimestamp = Date.now() + remaining * 1000
    - Write to localStorage (mm_focus_*)
    - Create/reuse timer.worker.js Web Worker
    - Worker sends { ts: Date.now() } every 1 000 ms
    - Main thread: remaining = Math.round((endTimestamp - ts) / 1000)
    - Update document.title = "25:00 — Focus"
  On visibilitychange → visible:
    - Snap remaining = Math.round((endTimestamp - Date.now()) / 1000)
  On Pause:
    - Terminate worker, store remainingMs in localStorage
  On Reset:
    - Terminate worker, clear localStorage keys, reset state
  On session end (remaining ≤ 0):
    - Play chime audio element
    - Fire Notification if granted
    - Flash document.title "✅ Done!"
    - Auto-advance mode (focus → shortBreak or longBreak)
    - Announce via aria-live "polite" region
```

**timer.worker.js** (~15 lines, lives in `/public/`):
```js
let id = null;
onmessage = e => {
  if (e.data === 'start') {
    id = setInterval(() => postMessage({ ts: Date.now() }), 1000);
  } else if (e.data === 'stop') {
    clearInterval(id);
  }
};
```

The hook is a "use client" component; the worker file must be served from `/public/` because Next.js App Router cannot bundle worker files in the standard import pipeline without an extra package (and L3 forbids that). The `new Worker('/timer.worker.js')` path works with Vercel's static serving.

### Sound Player

```
[useSoundPlayer hook]
  State: chip (rain|piano|focus|none), volume (0–1), isPlaying

  For synthesised chips (Deep Focus, Rain fallback):
    - Lazy-create AudioContext on first user tap (autoplay policy)
    - Generate 5-second PCM buffer (pink/brown noise algorithm)
    - AudioBufferSourceNode.loop = true; connect → GainNode → destination
    - navigator.audioSession.type = 'playback' (iOS mute-switch fix)

  For file-based chips (Rain, Soft Piano):
    - <audio> element with src="/audio/rain.ogg" loop preload="metadata"
    - On chip select: pause current, set src, play()
    - Volume: gainNode.gain.value = volume (Web Audio routed through gain)
    - Media Session API: set metadata (title, artist, artwork for lock screen)
    - Fade in: gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5)
    - Fade out: linearRampToValueAtTime(0, ctx.currentTime + 0.8)

  Autoplay rule compliance:
    - AudioContext.resume() / audio.play() ONLY inside user click handler
    - If play() throws NotAllowedError → show "tap to start sound" prompt

  Serwist caching:
    - Add /audio/*.ogg to sw.ts CacheFirst route with RangeRequestsPlugin
    - Keeps audio available offline; RangeRequestsPlugin handles iOS range requests
```

### SVG Arc
```
circumference = 2π × r  (r = 105 as in existing SVG)
strokeDashoffset = circumference × (remaining / totalSeconds)
// Updated on each tick, no CSS animation for the offset itself
// prefers-reduced-motion: skip rAF tween, set offset directly
```

### File format and size estimates

| File | Format | Bitrate | Expected size |
|---|---|---|---|
| rain.ogg | Ogg Vorbis q3 (~80 kbps) | 80 kbps | ~6 MB for 10 min |
| piano.ogg | Ogg Vorbis q5 (~160 kbps) | 160 kbps | ~12 MB for 10 min |
| Short piano loop (3 min) | Ogg Vorbis q5 | 160 kbps | ~3.6 MB |

> Recommendation: edit any long-form track down to a 3–5 minute loop point, verify loop point is clean (fade to same harmonic content), export as OGG q5. Keep total audio under 15 MB in `/public/audio/`.

### Hosting
- **Primary: `/public/audio/` on Vercel.** Files are served from the global Edge CDN. On Vercel Hobby (non-commercial), no bandwidth cap issues for a small app. On Vercel Pro, 1 TB/month included at \$0.01/GB overage — vastly cheaper than Supabase's \$0.09/GB overage.
- **Do not use Supabase Storage** for static audio files. Reserve it for user-generated content if added later.
- **Serwist:** Cache audio with `CacheFirst` + `RangeRequestsPlugin` in `app/sw.ts`. Max 3 entries, 30-day expiry. This is safe to add to the existing service worker without new packages.

---

## 5. Risks and Unknowns

| Risk | Severity | Notes |
|---|---|---|
| iOS audio suspension | High | When screen locks, all JS + audio stops. Only partial mitigation: use `<audio loop>` + `navigator.audioSession.type = 'playback'`. Timer will re-sync when user returns. Document this as a known limitation. |
| Freesound CC0 track availability | Medium | Individual tracks may be removed or re-licenced by their authors. Download and store the file at build time; do not fetch dynamically from Freesound. Keep the original source URL and date in a `/public/audio/CREDITS.txt`. |
| Incompetech Content ID | Medium | MacLeod's tracks are widely registered with Content ID systems. This only matters if the site's audio is played on YouTube; it has no effect on web playback. Attribution on the credits page is sufficient. |
| Pixabay licence changes | Medium | Pixabay changed its licence in 2019; it could change again. If chosen, snapshot the licence text at download time. |
| Web Worker in Next.js App Router | Medium | `new Worker('/timer.worker.js')` requires the file to be in `/public/`. Turbopack does not bundle it. This is the documented approach; no extra package needed. CONFIRM in a build test. |
| Ogg loop gap | Low | Ogg Vorbis in an `<audio>` element can have a small gap at loop points. Use Web Audio API `AudioBufferSourceNode` with `loop=true` and manual `loopStart`/`loopEnd` to bypass this. |
| `navigator.wakeLock` iOS bugs before 18.4 | Low | For iOS < 18.4, wake lock may fail silently. Acceptable — degrade gracefully, do not throw. |
| Notifications API permission | Low | Only request permission when user clicks Start, never on page load. If denied, the page-title fallback still works. |
| `musopen.org` daily download limit | Low | Free account limited to a small number of downloads per day. Only affects the developer fetching files for the build; not a production concern. |
| UNCONFIRMED Wikimedia track details | Low | Licence on individual tracks must be verified manually on the Commons file page before use. |

---

## 6. Proposed Scope for Task 17 (listed, NOT built)

> Task 17 is the **build task** that implements what this research proposes. All decisions below need product owner sign-off before building begins.

### Timer (Task 17-A)
1. Create `public/timer.worker.js` (15 lines).
2. Create `components/public/hooks/usePomodoroTimer.ts` — start, pause, reset, mode switch, `localStorage` persistence, Web Worker integration, Page Visibility API sync.
3. Wire the hook to `FocusThePractice.tsx` — convert the visual-only timer card to a live interactive timer.
4. Activate the arc sweep (animate `strokeDashoffset` from the hook's `remaining`/`totalSeconds` fraction).
5. Show remaining time in `document.title` while running.
6. Request Notifications API permission on Start click; fire notification on session end.
7. Play a short bell chime on session end (file: `/public/audio/bell.ogg`, ~20 KB, CC0 from Freesound).
8. Add `aria-live="polite"` milestone announcer.
9. Respect `prefers-reduced-motion` for arc tween.
10. Remove "Coming soon" badge from the timer card.

### Sound Player (Task 17-B)
1. Create `components/public/hooks/useSoundPlayer.ts` — chip select, volume, Web Audio API context, fade in/out.
2. Download and place approved audio files in `/public/audio/` (rain.ogg, piano.ogg); add `CREDITS.txt`.
3. Wire to `FocusTheJourney.tsx` — convert the visual-only player card to a live player.
4. Activate the waveform bars (animate bar heights to react to audio amplitude via `AnalyserNode`).
5. Animate the volume slider to control `GainNode`.
6. Implement Media Session API (title, artist, play/pause lock screen controls).
7. Add `navigator.audioSession.type = 'playback'` for iOS.
8. Add `CacheFirst` + `RangeRequestsPlugin` audio route to `app/sw.ts`.
9. Remove "Music player coming soon" badge from the player card.

### Attribution (Task 17-C)
1. Add a small "Credits" disclosure element (a hand-drawn link or footnote in the Focus Room footer) listing all CC BY track attributions.
2. If no CC BY tracks are used (all CC0 or synthesised), skip this step.

### Open questions for product owner before Task 17 begins
- Should the timer settings (25/5/15, sessions before long break) be user-configurable in Task 17, or locked to defaults?
- Should completed sessions be saved to Supabase (requires auth, table migration, L2/L11)? Or keep it `localStorage`-only?
- Is Incompetech CC BY 4.0 (requires a credits page) acceptable, or do we need fully CC0/PD for all music?
- Preference for "Rain & Nature": real recording (CC0 OGG) or synthesised pink noise only?
- Should the waveform bars animate to actual audio amplitude (requires `AnalyserNode`), or stay as a static decorative visual?
