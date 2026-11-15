// Pure schedule builder test runner
function formatShortClockTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildSchedule(settings, startTime = Date.now()) {
  const studyMin = Math.max(5, Math.min(120, Math.round(settings.studyMin)));
  const breakMin = settings.breakMin === 10 ? 10 : 5;
  const totalStudyMin = Math.max(15, Math.min(480, Math.round(settings.totalStudyMin)));

  const fullBlocks = Math.floor(totalStudyMin / studyMin);
  const remainder = totalStudyMin % studyMin;

  const focusSegments = [];
  let focusBlockCounter = 0;
  let scheduledStudyMinutes = 0;

  for (let i = 0; i < fullBlocks; i++) {
    focusBlockCounter++;
    focusSegments.push({
      id: `focus-${focusBlockCounter}`,
      phase: 'focus',
      minutes: studyMin,
      blockNumber: focusBlockCounter,
    });
    scheduledStudyMinutes += studyMin;
  }

  let droppedMinutes = 0;
  if (remainder >= 5) {
    focusBlockCounter++;
    focusSegments.push({
      id: `focus-${focusBlockCounter}`,
      phase: 'focus',
      minutes: remainder,
      blockNumber: focusBlockCounter,
    });
    scheduledStudyMinutes += remainder;
  } else if (remainder > 0) {
    droppedMinutes = remainder;
  }

  const segments = [];
  let breakCounter = 0;

  for (let i = 0; i < focusSegments.length; i++) {
    segments.push(focusSegments[i]);
    if (i < focusSegments.length - 1) {
      breakCounter++;
      segments.push({
        id: `break-${breakCounter}`,
        phase: 'break',
        minutes: breakMin,
      });
    }
  }

  const totalBreakMinutes = breakCounter * breakMin;
  const totalMinutes = scheduledStudyMinutes + totalBreakMinutes;
  const endsAtTimestamp = startTime + totalMinutes * 60 * 1000;
  const endsAt = formatShortClockTime(endsAtTimestamp);

  return {
    segments,
    focusBlocks: focusSegments.length,
    breaks: breakCounter,
    totalStudyMinutes: scheduledStudyMinutes,
    totalMinutes,
    endsAt,
    endsAtTimestamp,
    droppedMinutes,
  };
}

// Test Case 1: 25/5/120
const s1 = buildSchedule({ studyMin: 25, breakMin: 5, totalStudyMin: 120 });
console.log('Test 1 (25/5/120):', {
  focusBlocks: s1.focusBlocks,
  breaks: s1.breaks,
  totalStudyMinutes: s1.totalStudyMinutes,
  totalMinutes: s1.totalMinutes,
  droppedMinutes: s1.droppedMinutes,
  segments: s1.segments.map(s => `${s.phase[0].toUpperCase()}${s.minutes}`).join(', ')
});
console.assert(s1.focusBlocks === 5, 'focusBlocks should be 5');
console.assert(s1.breaks === 4, 'breaks should be 4');
console.assert(s1.totalMinutes === 140, 'totalMinutes should be 140');
console.assert(s1.droppedMinutes === 0, 'droppedMinutes should be 0');

// Test Case 2: 50/10/180
const s2 = buildSchedule({ studyMin: 50, breakMin: 10, totalStudyMin: 180 });
console.log('Test 2 (50/10/180):', {
  focusBlocks: s2.focusBlocks,
  breaks: s2.breaks,
  totalStudyMinutes: s2.totalStudyMinutes,
  totalMinutes: s2.totalMinutes,
  droppedMinutes: s2.droppedMinutes,
  segments: s2.segments.map(s => `${s.phase[0].toUpperCase()}${s.minutes}`).join(', ')
});
console.assert(s2.focusBlocks === 4, 'focusBlocks should be 4');
console.assert(s2.breaks === 3, 'breaks should be 3');
console.assert(s2.totalMinutes === 210, 'totalMinutes should be 210');
console.assert(s2.droppedMinutes === 0, 'droppedMinutes should be 0');

// Test Case 3: 25/5/15
const s3 = buildSchedule({ studyMin: 25, breakMin: 5, totalStudyMin: 15 });
console.log('Test 3 (25/5/15):', {
  focusBlocks: s3.focusBlocks,
  breaks: s3.breaks,
  totalStudyMinutes: s3.totalStudyMinutes,
  totalMinutes: s3.totalMinutes,
  droppedMinutes: s3.droppedMinutes,
  segments: s3.segments.map(s => `${s.phase[0].toUpperCase()}${s.minutes}`).join(', ')
});
console.assert(s3.focusBlocks === 1, 'focusBlocks should be 1');
console.assert(s3.breaks === 0, 'breaks should be 0');
console.assert(s3.totalMinutes === 15, 'totalMinutes should be 15');
console.assert(s3.droppedMinutes === 0, 'droppedMinutes should be 0');

// Test Case 4: Remainder < 5 (e.g. studyMin 25, totalStudyMin 52)
const s4 = buildSchedule({ studyMin: 25, breakMin: 5, totalStudyMin: 52 });
console.log('Test 4 (remainder < 5, 25/5/52):', {
  focusBlocks: s4.focusBlocks,
  breaks: s4.breaks,
  totalStudyMinutes: s4.totalStudyMinutes,
  totalMinutes: s4.totalMinutes,
  droppedMinutes: s4.droppedMinutes,
  segments: s4.segments.map(s => `${s.phase[0].toUpperCase()}${s.minutes}`).join(', ')
});
console.assert(s4.focusBlocks === 2, 'focusBlocks should be 2');
console.assert(s4.breaks === 1, 'breaks should be 1');
console.assert(s4.droppedMinutes === 2, 'droppedMinutes should be 2');

console.log('ALL SCHEDULE TESTS PASSED!');
