import { useEffect, useRef, useCallback } from 'react';

export default function useSessionTimeout(onTimeout, isActive, timeoutMs) {
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, timeoutMs);
  }, [onTimeout, timeoutMs]);

  useEffect(() => {
    if (!isActive) return;
    resetTimer();
    const onActivity = () => resetTimer();

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [isActive, resetTimer]);

  return resetTimer;
}