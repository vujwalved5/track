# TEAM SPEC: Switchable Focus Timer (The Ledger & Dial-First)

## 1. Branch Diffs (core vs design-a vs design-b)

### Comparison Summary
All three branches diverge from `feature/focus-timer-core` exclusively across four files:
- `components/public/hooks/useFocusSession.ts`
- `components/public/FocusThePractice.tsx`
- `components/public/FocusTimer.tsx`
- `next.config.js`

### A. `feature/focus-timer-design-a` ("The Ledger")
- **`components/public/hooks/useFocusSession.ts`**:
  - Adds task state (`taskText`, `setTaskText`, persisted in `localStorage` under `track.focus.task.v1`).
  - Adds checklist state (`clearDesk`, `chooseTask`, `takeBreath`, `skipped`, `toggleChecklistItem`, `skipChecklist`, `isChecklistCleared`).
  - Gates `start()` action: only proceeds if `isChecklistCleared` is true.
  - Adds `FocusSessionProvider` and `useFocusSessionContext`.
- **`components/public/FocusThePractice.tsx`**:
  - Wraps section with `<FocusSessionProvider>`.
  - Header displays `01 / THE PRACTICE` and `DESIGN A: THE LEDGER`.
  - Includes `BreathingGuide`: animated 4-stage box breathing guide (Inhale, Hold, Exhale, Rest at 4s intervals), active only when `status === 'running' && phase === 'break'`.
  - Includes `LedgerSidePanel`: order of elements is Checklist -> Task input -> Progress bar -> Breathing guide -> Ambient sound controls (pill buttons + volume + pause-in-breaks checkbox) -> Shrunk habit compass SVG.
- **`components/public/FocusTimer.tsx`**:
  - Presents "The Ledger" layout:
    - Header: `FOCUS SESSION / THE LEDGER` and Live Preview line (`X FOCUS BLOCKS / Y BREAKS / ENDS ABOUT HH:MM`).
    - Dial: 180° / 195° arc gauge with radial glow, orbit bead, central timer readout, and stepper controls below dial (Study stepper ±5m, Total stepper ±15m, Break toggle 5m/10m).
    - Schedule preview bar with proportional segments.
    - Action controls: Start (checklist gated), Pause/Resume, Skip, Reset (with inline confirmation), New Session.
  - Owns NO internal state (all driven by session context).
- **`next.config.js`**:
  - Adds `turbopack: { root: path.resolve(__dirname, '..') }`.

### B. `feature/focus-timer-design-b` ("Dial-First")
- **`components/public/hooks/useFocusSession.ts`**:
  - Identical in interface and functionality to Design A's hook.
- **`components/public/FocusThePractice.tsx`**:
  - Wraps section with `<FocusSessionProvider>`.
  - Header displays `01 / THE PRACTICE` and `DESIGN B: DIAL-FIRST`.
  - Includes `BreathingGuide` (same 4-stage box breathing).
  - Includes `DialFirstSidePanel`: order of elements is Task input -> Ambient sound controls (vertical list of 5 sounds with custom SVG waveforms + volume + pause-in-breaks) -> Checklist -> Progress bar -> Breathing guide -> Shrunk habit compass SVG.
- **`components/public/FocusTimer.tsx`**:
  - Presents "Dial-First" layout:
    - Header: `FOCUS SESSION / DIAL-FIRST` and Presets row (`PRESETS: STANDARD 25/5 / DEEP 50/10 / SPRINT 15/5`).
    - Dial: Full 360° circular dial segmented proportionally for every block and break in the schedule.
    - Owns local state: `activePill` (`'study' | 'break' | 'total'`).
    - Inside the dial in setup mode: displays 3 interactive pills for Study, Break, and Total with `+` / `-` increment/decrement buttons below. In running/paused/finished mode: shows block counter, live countdown, and phase label.
    - Schedule preview bar and Action controls with inline reset confirmation.
- **`next.config.js`**:
  - Identical to Design A.

### C. `feature/focus-timer-design-c` (Reference only)
- Design C is removed per instructions. No code or layout from Design C will be included.

---

## 2. Local State Analysis & State Lifting

### State Owned Locally in Existing Designs:
1. **Design A (`FocusTimer.tsx` / `FocusThePractice.tsx`)**:
   - `FocusTimer.tsx`: completely stateless; all values come from `useFocusSessionContext()`.
   - `FocusThePractice.tsx`: `BreathingGuide` owns `stageIndex` for the local 4-second animation cycle during active breaks.
2. **Design B (`FocusTimer.tsx`)**:
   - `activePill` (`'study' | 'break' | 'total'`, default `'study'`): determines which pill is active and manipulated by `+` / `-` buttons.
3. **Session & Global State**:
   - `taskText`, `checklist` ticks, `soundId`, `volume`, `pauseMusicInBreaks`, `chimeMuted`, `settings`, `status`, `currentSegmentIndex`, `remainingSeconds`, `isResetConfirmOpen`.

### State Lifted into the Wrapper (`FocusThePractice.tsx` / Session Context):
- **`activePill`** (`'study' | 'break' | 'total'`): Lifted into the shared context/wrapper so that if the user selects a pill in Design B, toggles to Design A, and toggles back to Design B in setup, the active pill selection is preserved without loss.
- **`layout`** (`'a' | 'b'`): Owned by the wrapper.
  - Initial value: `'a'` (server and initial client paint to prevent hydration mismatch).
  - Hydrated in `useEffect` from `localStorage.getItem('track.focus.layout.v1')`. Validated as `'a'` or `'b'`.
  - URL override `?layout=a` or `?layout=b` evaluated in `useEffect` during setup.
  - Locked during `running`, `paused`, and `finished` states.
- All session, checklist, task, and audio states remain in `useFocusSession` and are called exactly ONCE.

---

## 3. Exact File Map for New Structure

### A. New Components & Files
1. **`components/public/LayoutKnob.tsx`**:
   - 36px round rotary knob in navy (`#172536`), gold (`#B68A53`), and cream (`#F4EFE4`).
   - Two notches labelled "A" and "B" in uppercase font.
   - Gold pointer notch rotating between A and B with CSS transition (instant under `prefers-reduced-motion`).
   - `role="switch"` (or radiogroup) with `aria-label="Timer layout"` and `aria-checked` / `aria-valuetext` reflecting "Ledger" or "Dial-first".
   - Full keyboard accessibility: Click/Tap, Arrow Left/Right/Up/Down, Space, Enter.
   - Status text / tooltip below knob:
     - When setup: `"LEDGER"` or `"DIAL-FIRST"`
     - When running/paused/finished: `"LOCKED DURING SESSION"`, knob dimmed (`opacity-50 pointer-events-none cursor-not-allowed`), `aria-disabled="true"`.
2. **`components/public/LedgerLayout.tsx`**:
   - Clean presentational component rendering Design A ("The Ledger").
   - Left: Ledger Main Timer Card containing the top row with summary text, slot for `LayoutKnob`, 180° arc dial, steppers, schedule preview, and controls.
   - Right: `LedgerSidePanel` (Checklist -> Task -> Progress -> Breathing -> Sound -> Compass).
3. **`components/public/DialFirstLayout.tsx`**:
   - Clean presentational component rendering Design B ("Dial-First").
   - Left: Dial-First Main Timer Card containing the top row with Presets, slot for `LayoutKnob`, 360° segmented dial, interactive pills, schedule preview, and controls.
   - Right: `DialFirstSidePanel` (Task -> Sound list with waveforms -> Checklist -> Progress -> Breathing -> Compass).
4. **`TEAM_SPEC.md`**:
   - This specification file at the repository root.

### B. Modified Files
1. **`components/public/hooks/useFocusSession.ts`**:
   - Unified hook providing all session state, task state, checklist gate, audio state, and lifted `activePill` state.
   - `FocusSessionProvider` and `useFocusSessionContext` exporting the complete typed session API.
   - Preserves `?speed=60` dev-only multiplier, inert in production.
2. **`components/public/FocusThePractice.tsx`**:
   - Thin section wrapper calling `useFocusSession` via `FocusSessionProvider`.
   - Manages `layout` state (`'a' | 'b'`), `localStorage` persistence under `'track.focus.layout.v1'`, URL query parameter parsing, and session lock enforcement.
   - Dynamically renders `LedgerLayout` (Design A) or `DialFirstLayout` (Design B), passing the `LayoutKnob`.
   - Section header subtitle reflects active layout: `DESIGN A: THE LEDGER` or `DESIGN B: DIAL-FIRST`.
3. **`components/public/FocusTimer.tsx`**:
   - Retained as a thin dispatcher or compatibility export pointing to the active layout timer card.
4. **`next.config.js`**:
   - Includes `turbopack: { root: path.resolve(__dirname, '..') }`.

---

## 4. Implementation & Lock Rules
1. **Knob Enabled ONLY when `session.status === 'setup'`**.
2. **Knob Disabled when `session.status === 'running' | 'paused' | 'finished'`**:
   - Dimmed appearance, `aria-disabled="true"`, all keyboard and click events suppressed.
   - Caption renders `"LOCKED DURING SESSION"`.
   - `?layout=` URL query parameter and `localStorage` mutations ignored while not in setup.
3. **Responsive Header Row**:
   - At 1440px and 390px, knob sits top-right on the header row; summary/presets wrap gracefully without overlapping or causing horizontal scrolling.
4. **Zero State Loss**:
   - Switching between A and B in setup preserves study minutes, break minutes, total minutes, task description, checklist ticks, sound selection, volume, pause-in-breaks toggle, chime mute, and active pill.
