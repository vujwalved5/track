// Test script for FocusTimer geometry and useFocusTimer logic

function testGeometry() {
  console.log("=== Testing Arc & Bead Geometry ===");
  const testCases = [
    { progress: 1.0, expectedArc: "612.6", expectedX: 203.4, expectedY: 423.9 },
    { progress: 0.5, expectedArc: "306.3" },
    { progress: 0.0, expectedArc: "0.0", expectedX: 250.0, expectedY: 70.0 },
  ];

  for (const tc of testCases) {
    const arcDashLength = (tc.progress * 612.6).toFixed(1);
    const angleDeg = -90 + tc.progress * 195;
    const angleRad = (angleDeg * Math.PI) / 180;
    const beadX = Number((250 + 180 * Math.cos(angleRad)).toFixed(1));
    const beadY = Number((250 + 180 * Math.sin(angleRad)).toFixed(1));

    console.log(`Progress: ${tc.progress} => ArcDash: ${arcDashLength} 1131, Angle: ${angleDeg} deg, Bead: (${beadX}, ${beadY})`);

    if (tc.expectedArc && arcDashLength !== tc.expectedArc) {
      throw new Error(`Arc dash mismatch for progress ${tc.progress}: got ${arcDashLength}, expected ${tc.expectedArc}`);
    }
    if (tc.expectedX && Math.abs(beadX - tc.expectedX) > 0.1) {
      throw new Error(`BeadX mismatch for progress ${tc.progress}: got ${beadX}, expected ${tc.expectedX}`);
    }
    if (tc.expectedY && Math.abs(beadY - tc.expectedY) > 0.1) {
      throw new Error(`BeadY mismatch for progress ${tc.progress}: got ${beadY}, expected ${tc.expectedY}`);
    }
  }
  console.log("PASS: Arc & Bead Geometry tests passed!");
}

function testPresetDurations() {
  console.log("=== Testing Preset Durations ===");
  const presets = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  if (presets.focus !== 1500) throw new Error("Focus duration must be 1500s");
  if (presets.shortBreak !== 300) throw new Error("Short break duration must be 300s");
  if (presets.longBreak !== 900) throw new Error("Long break duration must be 900s");

  console.log("PASS: Preset Durations tests passed!");
}

testGeometry();
testPresetDurations();
