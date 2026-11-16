// scripts/challenger_qa/probe_1_timer.js
/**
 * Adversarial Timer Verification Probe
 * Tests:
 * 1. Elapsed time calculation under simulated background delays / setInterval throttling.
 *    Verifies accuracy to wall clock Date.now().
 * 2. Start -> pause -> resume sequence: verifies correct elapsed time accumulation.
 * 3. Preset switching: Focus (25m) -> Short Break (5m) -> Long Break (15m).
 * 4. Countdown reaching 00:00: clean completion, no negative numbers, no infinite loop.
 */

const assert = require('assert');

// Logic extracted directly from components/public/hooks/useFocusTimer.ts
const PRESET_CONFIG = {
  focus: {
    key: 'focus',
    label: 'FOCUS 25 MIN',
    duration: 25 * 60, // 1500s
    title: 'FOCUS SESSION',
  },
  shortBreak: {
    key: 'shortBreak',
    label: 'SHORT BREAK 5 MIN',
    duration: 5 * 60, // 300s
    title: 'SHORT BREAK',
  },
  longBreak: {
    key: 'longBreak',
    label: 'LONG BREAK 15 MIN',
    duration: 15 * 60, // 900s
    title: 'LONG BREAK',
  },
};

function formatDuration(seconds) {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

class SimulatedTimerEngine {
  constructor(initialPreset = 'focus', mockClock = null) {
    this.mockClock = mockClock || { now: 1000000 };
    this.activePreset = initialPreset;
    this.totalDuration = PRESET_CONFIG[initialPreset].duration;
    this.timeRemaining = this.totalDuration;
    this.timeRemainingRef = this.totalDuration;
    this.isRunning = false;
    this.isFinished = false;
    this.progress = 1;
    this.targetTimestamp = null;
    this.activePresetRef = initialPreset;
  }

  getNow() {
    return this.mockClock.now;
  }

  advanceClock(ms) {
    this.mockClock.now += ms;
  }

  start() {
    if (this.isRunning) return;

    let remaining = this.timeRemainingRef;
    if (remaining <= 0 || this.isFinished) {
      remaining = PRESET_CONFIG[this.activePresetRef].duration;
      this.timeRemainingRef = remaining;
      this.timeRemaining = remaining;
      this.progress = 1;
      this.isFinished = false;
    }

    const now = this.getNow();
    this.targetTimestamp = now + remaining * 1000;
    this.isRunning = true;
    this.isFinished = false;
  }

  pause() {
    if (!this.isRunning) return;

    if (this.targetTimestamp !== null) {
      const now = this.getNow();
      const msRemaining = this.targetTimestamp - now;
      const secondsRemaining = Math.max(0, Math.ceil(msRemaining / 1000));
      this.timeRemainingRef = secondsRemaining;
      this.timeRemaining = secondsRemaining;

      const totalSec = PRESET_CONFIG[this.activePresetRef].duration;
      const currentProgress = totalSec > 0 ? Math.max(0, Math.min(1, secondsRemaining / totalSec)) : 0;
      this.progress = currentProgress;
    }

    this.targetTimestamp = null;
    this.isRunning = false;
  }

  reset() {
    this.targetTimestamp = null;
    const presetDuration = PRESET_CONFIG[this.activePresetRef].duration;
    this.timeRemainingRef = presetDuration;
    this.timeRemaining = presetDuration;
    this.progress = 1;
    this.isRunning = false;
    this.isFinished = false;
  }

  setPreset(preset) {
    this.targetTimestamp = null;
    this.activePreset = preset;
    this.activePresetRef = preset;

    const presetDuration = PRESET_CONFIG[preset].duration;
    this.timeRemainingRef = presetDuration;
    this.timeRemaining = presetDuration;
    this.progress = 1;
    this.isRunning = false;
    this.isFinished = false;
  }

  tick() {
    if (!this.isRunning || this.targetTimestamp === null) return;

    const now = this.getNow();
    const msRemaining = this.targetTimestamp - now;

    if (msRemaining <= 0) {
      this.targetTimestamp = null;
      this.timeRemainingRef = 0;
      this.timeRemaining = 0;
      this.progress = 0;
      this.isRunning = false;
      this.isFinished = true;
      return;
    }

    const secondsRemaining = Math.ceil(msRemaining / 1000);
    this.timeRemainingRef = secondsRemaining;
    this.timeRemaining = secondsRemaining;

    const totalSec = PRESET_CONFIG[this.activePresetRef].duration;
    const currentProgress = totalSec > 0 ? Math.max(0, Math.min(1, msRemaining / (totalSec * 1000))) : 0;
    this.progress = currentProgress;
  }
}

const results = [];

function recordTest(testName, passed, details) {
  results.push({ testName, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}: ${details}`);
}

// =========================================================================
// TEST SUITE 1: Timer Drift under Extreme Throttling / Delay Simulations
// =========================================================================
function runDriftTests() {
  console.log('\n--- 1. Timer Drift & Background Delays ---');
  const clock = { now: 1000000 };
  const timer = new SimulatedTimerEngine('focus', clock);

  timer.start();
  // Simulate 10 normal 250ms ticks
  for (let i = 0; i < 10; i++) {
    clock.now += 250;
    timer.tick();
  }
  // At 2500ms elapsed, remaining should be 1500 - 2.5 = 1497.5 -> Math.ceil = 1498s
  const check1 = timer.timeRemaining === 1498;
  recordTest('Normal 250ms ticks (2.5s elapsed)', check1, `Remaining: ${timer.timeRemaining}s (expected 1498s)`);

  // Now simulate extreme background throttling (tab backgrounded for 60 seconds without ticks)
  clock.now += 60000;
  // A single tick occurs after background delay
  timer.tick();
  // Total elapsed: 62.5s. Target remaining: 1500 - 62.5 = 1437.5 -> Math.ceil = 1438s
  const check2 = timer.timeRemaining === 1438;
  recordTest('Single tick after 60s background sleep', check2, `Remaining: ${timer.timeRemaining}s, drift = 0s relative to Date.now()`);

  // Simulate machine sleeping for 10 minutes (600s)
  clock.now += 600000;
  timer.tick();
  // Total elapsed: 662.5s. Target remaining: 1500 - 662.5 = 837.5 -> Math.ceil = 838s
  const check3 = timer.timeRemaining === 838;
  recordTest('Single tick after 10m OS sleep', check3, `Remaining: ${timer.timeRemaining}s (exact wall clock match)`);

  // Verify that progress matches msRemaining / totalMs
  const expectedProgress = (timer.targetTimestamp - clock.now) / (1500 * 1000);
  const checkProgress = Math.abs(timer.progress - expectedProgress) < 1e-6;
  recordTest('Progress accurately tracks msRemaining ratio', checkProgress, `Progress: ${timer.progress.toFixed(5)}`);
}

// =========================================================================
// TEST SUITE 2: Start -> Pause -> Resume Sequence
// =========================================================================
function runStartPauseResumeTests() {
  console.log('\n--- 2. Start -> Pause -> Resume Accuracy ---');
  const clock = { now: 5000000 };
  const timer = new SimulatedTimerEngine('focus', clock);

  timer.start();
  // Run for 15 seconds
  clock.now += 15000;
  timer.tick();
  assert.strictEqual(timer.timeRemaining, 1485);

  // Pause
  timer.pause();
  recordTest('Pause state verification', !timer.isRunning && timer.timeRemaining === 1485, `Paused at ${timer.timeRemaining}s`);

  // Spend 120 seconds in paused state
  clock.now += 120000;
  timer.tick(); // Should be a no-op while paused
  recordTest('Time frozen during pause', timer.timeRemaining === 1485, `Remaining still ${timer.timeRemaining}s after 120s paused`);

  // Resume
  timer.start();
  recordTest('Resume verification', timer.isRunning && timer.timeRemaining === 1485, `Resumed from ${timer.timeRemaining}s`);

  // Run for another 25 seconds
  clock.now += 25000;
  timer.tick();
  const checkResume = timer.timeRemaining === 1460;
  recordTest('Post-resume tick accuracy', checkResume, `Remaining: ${timer.timeRemaining}s (expected 1460s)`);

  // Rapid start/pause flapping
  for (let cycle = 0; cycle < 5; cycle++) {
    timer.pause();
    clock.now += 500;
    timer.start();
    clock.now += 1000;
    timer.tick();
  }
  recordTest('Rapid start/pause cycling stability', timer.isRunning && timer.timeRemaining === 1455, `Remaining after 5 rapid cycles: ${timer.timeRemaining}s`);
}

// =========================================================================
// TEST SUITE 3: Preset Switching
// =========================================================================
function runPresetSwitchingTests() {
  console.log('\n--- 3. Preset Switching ---');
  const clock = { now: 8000000 };
  const timer = new SimulatedTimerEngine('focus', clock);

  // Start focus timer, run for 100s
  timer.start();
  clock.now += 100000;
  timer.tick();
  assert.strictEqual(timer.timeRemaining, 1400);

  // Switch to Short Break while running
  timer.setPreset('shortBreak');
  const checkShort = !timer.isRunning && timer.timeRemaining === 300 && timer.activePreset === 'shortBreak' && timer.progress === 1;
  recordTest('Switch to Short Break while running', checkShort, `Reset to 300s, stopped, progress 1.0`);

  // Start short break, run for 50s
  timer.start();
  clock.now += 50000;
  timer.tick();
  recordTest('Short break running tick', timer.timeRemaining === 250, `Remaining: ${timer.timeRemaining}s`);

  // Switch to Long Break
  timer.setPreset('longBreak');
  const checkLong = !timer.isRunning && timer.timeRemaining === 900 && timer.activePreset === 'longBreak';
  recordTest('Switch to Long Break', checkLong, `Reset to 900s, stopped`);

  // Switch back to Focus
  timer.setPreset('focus');
  const checkFocus = !timer.isRunning && timer.timeRemaining === 1500 && timer.activePreset === 'focus';
  recordTest('Switch back to Focus', checkFocus, `Reset to 1500s, stopped`);
}

// =========================================================================
// TEST SUITE 4: Reaching 00:00 & Edge Cases
// =========================================================================
function runCompletionEdgeCases() {
  console.log('\n--- 4. Countdown Reaching 00:00 & Edge Cases ---');
  const clock = { now: 10000000 };
  const timer = new SimulatedTimerEngine('shortBreak', clock);

  timer.start();
  // Fast forward to exactly 1s remaining
  clock.now += 299000;
  timer.tick();
  recordTest('1 second remaining', timer.timeRemaining === 1, `Time: ${formatDuration(timer.timeRemaining)}`);

  // Tick past 0 (overshoot by 500ms)
  clock.now += 1500;
  timer.tick();
  const checkComplete = timer.timeRemaining === 0 &&
                        timer.isFinished === true &&
                        timer.isRunning === false &&
                        timer.progress === 0 &&
                        formatDuration(timer.timeRemaining) === '00:00';
  recordTest('Zero reaching completion state', checkComplete, `Remaining: ${timer.timeRemaining}, formatted: ${formatDuration(timer.timeRemaining)}, isFinished: ${timer.isFinished}`);

  // Subsequent ticks after completion must remain 0 and not throw or loop
  clock.now += 5000;
  timer.tick();
  recordTest('Subsequent ticks remain 0', timer.timeRemaining === 0 && timer.isFinished === true, `Remaining remains ${timer.timeRemaining}s`);

  // Negative overshoot simulation (clock skips 3600 seconds)
  const timer2 = new SimulatedTimerEngine('shortBreak', clock);
  timer2.start();
  clock.now += 3600000; // 1 hour jump!
  timer2.tick();
  const checkClamp = timer2.timeRemaining === 0 && timer2.isFinished === true && timer2.progress === 0;
  recordTest('Massive time jump clamps cleanly at 0s (no negative values)', checkClamp, `Remaining: ${timer2.timeRemaining}s, formatted: ${formatDuration(timer2.timeRemaining)}`);

  // Pressing START after completion restarts preset from full duration
  timer.start();
  const checkRestart = timer.isRunning === true &&
                       timer.isFinished === false &&
                       timer.timeRemaining === 300 &&
                       timer.progress === 1;
  recordTest('Pressing START after completion restarts preset', checkRestart, `Duration restarted to ${timer.timeRemaining}s, running: ${timer.isRunning}`);

  // Formatting tests for extreme inputs
  const f1 = formatDuration(0) === '00:00';
  const f2 = formatDuration(-5) === '00:00'; // clamped to 0
  const f3 = formatDuration(1500) === '25:00';
  const f4 = formatDuration(300) === '05:00';
  const f5 = formatDuration(59) === '00:59';
  recordTest('formatDuration edge cases', f1 && f2 && f3 && f4 && f5, `0 -> ${formatDuration(0)}, -5 -> ${formatDuration(-5)}, 1500 -> ${formatDuration(1500)}`);
}

// =========================================================================
// TEST SUITE 5: Arc Geometry & Bead Position Formulas
// =========================================================================
function runGeometryFormulas() {
  console.log('\n--- 5. Arc Geometry & Dynamic Bead Position ---');
  // Formula: angleDeg = -90 + progress * 195;
  // beadX = 250 + 180 * cos(angleRad)
  // beadY = 250 + 180 * sin(angleRad)
  const p1 = 1.0;
  const angle1 = -90 + p1 * 195; // 105 deg
  const rad1 = (angle1 * Math.PI) / 180;
  const beadX1 = Number((250 + 180 * Math.cos(rad1)).toFixed(1));
  const beadY1 = Number((250 + 180 * Math.sin(rad1)).toFixed(1));
  const arcDash1 = (p1 * 612.6).toFixed(1);

  const check1 = Math.abs(beadX1 - 203.4) < 0.1 && Math.abs(beadY1 - 423.9) < 0.1 && arcDash1 === '612.6';
  recordTest('Geometry at progress 1.0 (Full arc)', check1, `arcDash: ${arcDash1}, bead: (${beadX1}, ${beadY1}), angle: ${angle1}°`);

  const p0 = 0.0;
  const angle0 = -90 + p0 * 195; // -90 deg (12 o'clock)
  const rad0 = (angle0 * Math.PI) / 180;
  const beadX0 = Number((250 + 180 * Math.cos(rad0)).toFixed(1));
  const beadY0 = Number((250 + 180 * Math.sin(rad0)).toFixed(1));
  const arcDash0 = (p0 * 612.6).toFixed(1);

  const check0 = Math.abs(beadX0 - 250.0) < 0.1 && Math.abs(beadY0 - 70.0) < 0.1 && arcDash0 === '0.0';
  recordTest('Geometry at progress 0.0 (Zero arc)', check0, `arcDash: ${arcDash0}, bead: (${beadX0}, ${beadY0}), angle: ${angle0}°`);
}

runDriftTests();
runStartPauseResumeTests();
runPresetSwitchingTests();
runCompletionEdgeCases();
runGeometryFormulas();

const allPassed = results.every(r => r.passed);
console.log(`\n=== PROBE 1 SUMMARY: ${results.filter(r => r.passed).length}/${results.length} PASSED ===`);
if (!allPassed) {
  process.exit(1);
}
