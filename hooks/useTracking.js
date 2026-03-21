'use client';

import { useRef } from 'react';
import { getTrackingManager } from '../lib/tracking';

export function useTracking() {
  const managerRef = useRef(null);

  if (!managerRef.current) {
    managerRef.current = getTrackingManager();
  }

  return managerRef.current;
}
