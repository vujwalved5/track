# TEAM_SPEC.md — Focus Room Architecture & Specification

This specification governs the implementation of the Focus Room timer engine and its three alternative design implementations. Every engineer and designer must adhere to the conventions, APIs, and constraints defined here.

---

## 1. File Map

| Path | Purpose | Owners |
|---|---|---|
| `lib/focusSchedule.ts` | Pure schedule calculation engine (block division, remainder logic, summary). | Core Engineer |
| `lib/ambient.ts` | Web Audio sound generator (brown, pink, white, rain), volume, 300ms fades, chimes, audio persistence. | Core Engineer |
| `components/public/hooks/useFocusSession.ts` | Primary React hook orchestrating timer state, drift-free timestamp ticks, auto-start, audio triggers, settings persistence. | Core Engineer |
| `components/public/FocusTimer.tsx` | Base timer dial component; replaced / customized per design branch. | Core / Designers |
| `components/public/FocusThePractice.tsx` | Section 01 container holding timer card (left) and cream side panel (right). | Core / Designers |
| `components/public/FocusTheJourney.tsx` | Ambient sound preview card in Section 02. | Core (shared) |

### Branch Target Files for Designers
- **Designer A ("The Ledger")** on branch `feature/focus-timer-design-a`:
  - Edits: `components/public/FocusTimer.tsx` and `components/public/FocusThePractice.tsx`
- **Designer B ("Dial-First")** on branch `feature/focus-timer-design-b`:
  - Edits: `components/public/FocusTimer.tsx` and `components/public/FocusThePractice.tsx`
- **Designer C ("Session Strip")** on branch `feature/focus-timer-design-c`:
  - Edits: `components/public/FocusTimer.tsx` and `components/public/FocusThePractice.tsx`

---

## 2. Design Tokens & Visual Constraints

### Palette
- **Navy Dark Background**: `#172536`
- **Offset Slab Shadow**: `#0d1926`
- **Surface Dark**: `#1a2b3d`
- **Track Dark**: `#1e3044`
- **Cream Paper**: `#F4EFE4`
- **Gold / Brass**: `#B68A53`, `#D2A75D`
- **Tobacco (Wood / Text on Cream)**: `#60432F`
- **Muted Slate / Blue**: `#8799A7`
- **Dividers & Borders**:
  - Dark container border: `border-[#F4EFE4]/15` or `border-[#B68A53]/30`
  - Cream card inner border: `border-[#172536]/18` or `border-[#172536]/25`

### Typography Classes
- **Condensed Eyebrow & Labels**: `font-public-condensed text-xs uppercase tracking-[0.22em] font-semibold text-[#B68A53]`
- **Display Digits & Headings**: `font-public-display` (`var(--font-italiana)`)
- **Body & Checklist**: `font-public-sans` (`var(--font-dm-sans)`)
- **Script Accents**: `font-public-hand` (`var(--font-caveat)`)

### Interaction & A11y
- Real `<button>` and `<input>` elements with visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#B68A53] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172536]`).
- All icon-only buttons require explicit `aria-label`.
- Inline confirms only (e.g., small "Reset session" / "Keep going" buttons). **Never** `window.confirm`, `alert`, or modal overlays.
- Respect `prefers-reduced-motion` via `motion-safe:` / `motion-reduce:`.
- **Zero emoji**: All icons must be hand-drawn inline SVGs.
- **Zero audio files**: All ambient noise and chimes are synthesized via the Web Audio API.

---

## 3. Exported Module APIs

### 3.1 Pure Schedule Builder (`lib/focusSchedule.ts`)

```typescript
export type SessionPhase = 'focus' | 'break';

export interface FocusSettings {
  studyMin: number;       // 5 to 120, step 5, default 25
  breakMin: 5 | 10;       // strictly 5 or 10, default 5
  totalStudyMin: number;  // 15 to 480, step 15, default 120
}

export interface ScheduleSegment {
  id: string;
  phase: SessionPhase;
  minutes: number;
  blockNumber?: number;   // 1-based index for focus blocks
}

export interface ScheduleSummary {
  segments: ScheduleSegment[];
  focusBlocks: number;
  breaks: number;
  totalStudyMinutes: number; // actual scheduled focus minutes
  totalMinutes: number;      // total study + break minutes
  endsAt: string;            // e.g. "11:35" or "11:35 AM"
  droppedMinutes: number;    // remainder < 5 dropped minutes
}

export function buildSchedule(
  settings: FocusSettings,
  startTime: number = Date.now()
): ScheduleSummary;
```

#### Schedule Rules
1. Total = study time only; breaks are added on top.
2. `fullBlocks = Math.floor(totalStudyMin / studyMin)`.
3. `remainder = totalStudyMin % studyMin`.
4. If `remainder >= 5`, add a final shorter focus block equal to the remainder.
5. If `remainder < 5`, drop it and record `droppedMinutes = remainder`.
6. Insert one break (`breakMin`) between every pair of focus blocks; none after the last focus block.
7. If only 1 focus block exists, 0 breaks are inserted.

---

### 3.2 Ambient Music & Chimes Engine (`lib/ambient.ts`)

```typescript
export type AmbientSoundId = 'off' | 'brown' | 'pink' | 'white' | 'rain';

export interface AmbientAudioEngine {
  setSound: (id: AmbientSoundId) => void;
  setVolume: (vol: number) => void; // 0 to 1, default 0.25
  pause: () => void;
  resume: () => void;
  fadeToMute: (durationMs?: number) => void;
  fadeToCurrentVolume: (durationMs?: number) => void;
  cleanup: () => void;
  getSound: () => AmbientSoundId;
  getVolume: () => number;
}

export function getAmbientEngine(): AmbientAudioEngine;

// Chime Synthesis (Web Audio sine waves)
export function playChime(type: 'segment' | 'finished', muted?: boolean): void;
export function playSkipTick(muted?: boolean): void;
```

#### Sound Synthesis Specifications
- **Brown Noise**: Leaky integrator / random walk on white noise through soft low-pass filter (~400 Hz), looped 4s `AudioBuffer`.
- **Pink Noise**: Paul Kellet 3-pole filter approximation of 1/f slope, looped 4s `AudioBuffer`.
- **White Noise**: Uniform random samples through soft low-pass filter (~6000 Hz), looped 4s `AudioBuffer`.
- **Rain**: Pink noise through band-pass filter (~800–1200 Hz) combined with sparse, randomized high-passed clicks (~3000 Hz, short decay).
- **Segment Chime**: Two soft sine notes (e.g. 523.25 Hz C5 -> 659.25 Hz E5), ~0.8s gentle envelope, peak gain 0.15.
- **Finished Chime**: Three soft sine notes (e.g. 523.25 Hz C5 -> 659.25 Hz E5 -> 783.99 Hz G5), ~1.5s envelope, peak gain 0.18.
- **Skip Tick**: Very short, soft click (single 10ms burst, low gain).

---

### 3.3 Focus Session Hook (`components/public/hooks/useFocusSession.ts`)

```typescript
export type SessionStatus = 'setup' | 'running' | 'paused' | 'finished';

export interface UseFocusSessionReturn {
  // Session states
  status: SessionStatus;
  phase: SessionPhase;
  currentSegmentIndex: number;
  currentSegment: ScheduleSegment | null;
  totalSegments: number;
  currentBlockNumber: number; // e.g. 2 for "BLOCK 2 OF 5"
  totalFocusBlocks: number;   // e.g. 5
  studiedMinutes: number;     // completed focus minutes
  totalTargetStudyMinutes: number; // target total study minutes
  remainingSeconds: number;   // remaining in active segment
  formattedTime: string;      // MM:SS
  segmentProgress: number;    // 0..1 remaining in current segment
  overallProgress: number;    // 0..1 across entire study schedule
  
  // Settings & Schedule
  settings: FocusSettings;
  schedule: ScheduleSummary;
  updateSettings: (changes: Partial<FocusSettings>) => void;
  applyPreset: (studyMin: number, breakMin: 5 | 10, totalStudyMin?: number) => void;
  
  // Controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  togglePauseResume: () => void;
  skip: () => void;
  
  // Reset with inline confirmation
  isResetConfirmOpen: boolean;
  openResetConfirm: () => void;
  cancelResetConfirm: () => void;
  confirmReset: () => void;
  
  // Audio state & controls
  soundId: AmbientSoundId;
  setSoundId: (id: AmbientSoundId) => void;
  volume: number;
  setVolume: (v: number) => void;
  pauseMusicInBreaks: boolean;
  setPauseMusicInBreaks: (v: boolean) => void;
  chimeMuted: boolean;
  setChimeMuted: (v: boolean) => void;
  
  // Speed multiplier for testing (?speed=60)
  speedMultiplier: number;
}
```

#### Timing & Tab Drift
- Store target timestamp: `targetTimestamp = Date.now() + remainingMs / speedMultiplier`.
- Interval tick runs every 250 ms: `remainingMs = Math.max(0, (targetTimestamp - Date.now()) * speedMultiplier)`.
- When segment finishes (`remainingMs <= 0`):
  - If more segments exist: auto-advance to next segment, play `"segment"` chime, continue running.
  - If last focus block ends: status becomes `"finished"`, play `"finished"` chime, pause music.
- While running: updates `document.title` (e.g. `[FOCUS] 24:30 — TRACK`). On pause/finish/reset: reverts to default title.
- Presets:
  - 25 / 5 (default 120 total)
  - 50 / 10 (default 180 total)
  - 90 / 10 (default 180 total)

---

## 4. Companion Features (Required across all 3 designs)

Every design must include these companion features:
1. **Checklist Gate**:
   - 3 items: "Clear your desk", "Choose one task", "Take a breath".
   - In setup mode: START button is disabled until all 3 are checked, OR the user clicks "Skip checklist".
2. **Task Text Input**:
   - Persisted in localStorage (`track.focus.task.v1`).
   - Displayed cleanly (e.g., under the dial label or in the companion panel) while running.
3. **Progress Indicators**:
   - Text display: `"BLOCK X OF Y"` (e.g. `"BLOCK 2 OF 5"`).
   - Thin progress bar: `"STUDIED M / N MIN"` showing completed focus minutes vs total.
4. **Breathing Guide**:
   - 4-stage box breathing: `INHALE` (4s) -> `HOLD` (4s) -> `EXHALE` (4s) -> `REST` (4s).
   - **Active ONLY during break segments**.
   - Static during focus.
   - Respect `prefers-reduced-motion`: step highlighting instead of continuous scaling.
5. **Sound Controls**:
   - Sound selection: `OFF`, `BROWN`, `PINK`, `WHITE`, `RAIN`.
   - Volume slider (0 to 100%).
   - Toggle: "Pause music during breaks" (default: checked).
   - Toggle: Chime mute.
6. **Habit Balance / Compass Illustration**:
   - Maintained in the layout (shrink as needed so all elements fit comfortably without scrolling or overflowing).

---

## 5. Verification Commands

Before any commit is finalized on any branch:
```bash
npx tsc --noEmit
npm run lint
npm run build
```
All three commands must exit with code 0.
