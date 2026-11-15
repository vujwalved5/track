export type SessionPhase = 'focus' | 'break';

export interface FocusSettings {
  studyMin: number;       // default 25, range 5 to 120
  breakMin: 5 | 10;       // ONLY 5 or 10, default 5
  totalStudyMin: number;  // default 120, range 15 to 480, step 15
}

export interface ScheduleSegment {
  id: string;
  phase: SessionPhase;
  minutes: number;
  blockNumber?: number; // 1-based index for focus blocks
}

export interface ScheduleSummary {
  segments: ScheduleSegment[];
  focusBlocks: number;
  breaks: number;
  totalStudyMinutes: number; // Scheduled focus minutes
  totalMinutes: number;      // Total focus + break minutes
  endsAt: string;            // Clock time when session ends if started now (e.g. "11:35")
  endsAtTimestamp: number;   // Timestamp (ms)
  droppedMinutes: number;    // Remainder < 5 min dropped
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  studyMin: 25,
  breakMin: 5,
  totalStudyMin: 120,
};

export function formatClockTime(timestamp: number): string {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12
  return `${hours}:${minutes} ${ampm}`;
}

export function formatShortClockTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Pure schedule builder (no React, unit-testable):
 * - Total = STUDY time only; breaks are added on top.
 * - fullBlocks = floor(total / studyMin); remainder = total % studyMin.
 * - If remainder >= 5, add a final shorter focus block equal to the remainder;
 *   if < 5, drop it and expose droppedMinutes.
 * - A break between every pair of focus blocks; none after the last.
 */
export function buildSchedule(
  settings: FocusSettings,
  startTime: number = Date.now()
): ScheduleSummary {
  const studyMin = Math.max(5, Math.min(120, Math.round(settings.studyMin)));
  const breakMin: 5 | 10 = settings.breakMin === 10 ? 10 : 5;
  const totalStudyMin = Math.max(15, Math.min(480, Math.round(settings.totalStudyMin)));

  const fullBlocks = Math.floor(totalStudyMin / studyMin);
  const remainder = totalStudyMin % studyMin;

  const focusSegments: ScheduleSegment[] = [];
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

  // Interleave breaks: a break between every pair of focus blocks; none after the last.
  const segments: ScheduleSegment[] = [];
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
