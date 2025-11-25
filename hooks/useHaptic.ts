
import { useCallback } from 'react';

export const useHaptic = () => {
  const trigger = useCallback((pattern: number | number[] = 50) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const success = useCallback(() => trigger([10, 30, 10]), [trigger]);
  const error = useCallback(() => trigger([50, 30, 50, 30, 50]), [trigger]);
  const light = useCallback(() => trigger(10), [trigger]);

  return { trigger, success, error, light };
};
