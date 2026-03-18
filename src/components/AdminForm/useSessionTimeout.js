import { useEffect, useRef, useCallback } from 'react';

export default function useSessionTimeout(onTimeout, isActive, timeoutMs) {
  const timerRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  const timeoutMsRef = useRef(timeoutMs);

  // Update refs when props change without triggering effects
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    timeoutMsRef.current = timeoutMs;
  }, [onTimeout, timeoutMs]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onTimeoutRef.current?.();
    }, timeoutMsRef.current);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    resetTimer();
    const onActivity = () => resetTimer();

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('mousedown', onActivity);
    window.addEventListener('touchstart', onActivity);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [isActive, resetTimer]);

  return resetTimer;
}