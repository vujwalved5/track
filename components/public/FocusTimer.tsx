'use client';

import React from 'react';
import { LedgerLayout } from './LedgerLayout';

export interface FocusTimerProps {
  className?: string;
  knobNode?: React.ReactNode;
}

/**
 * FocusTimer presentational component.
 * Layout-specific timers are cleanly encapsulated inside LedgerLayout and DialFirstLayout.
 */
export function FocusTimer({ knobNode }: FocusTimerProps) {
  return <LedgerLayout knobNode={knobNode} />;
}

export default FocusTimer;
