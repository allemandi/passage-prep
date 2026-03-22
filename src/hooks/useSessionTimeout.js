import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'passage_prep_last_activity';

export default function useSessionTimeout(onTimeout, isActive, timeoutMs) {
  const [remainingTime, setRemainingTime] = useState(timeoutMs);
  const onTimeoutRef = useRef(onTimeout);
  const timeoutMsRef = useRef(timeoutMs);

  // Update refs when props change without triggering effects
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
    timeoutMsRef.current = timeoutMs;
  }, [onTimeout, timeoutMs]);

  const resetTimer = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setRemainingTime(timeoutMsRef.current);
  }, []);

  useEffect(() => {
    if (!isActive) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Initialize last activity if not present
    if (!localStorage.getItem(STORAGE_KEY)) {
      resetTimer();
    }

    const checkTimeout = () => {
      const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = Math.max(0, timeoutMsRef.current - elapsed);

      setRemainingTime(remaining);

      if (remaining <= 0) {
        onTimeoutRef.current?.();
      }
    };

    // Check every second
    const intervalId = setInterval(checkTimeout, 1000);

    const onActivity = () => resetTimer();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTimeout();
      }
    };
    const onStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        checkTimeout();
      }
    };

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('mousedown', onActivity);
    window.addEventListener('touchstart', onActivity);
    window.addEventListener('scroll', onActivity);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('storage', onStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('scroll', onActivity);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('storage', onStorageChange);
    };
  }, [isActive, resetTimer]);

  return { resetTimer, remainingTime };
}
