import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage AbortController for request cancellation.
 * Ensures stale API responses don't overwrite newer state.
 * Automatically cancels pending requests on unmount or when trigger changes.
 * 
 * Example: When user changes filters mid-request, old request is cancelled
 * @returns AbortSignal to pass to API
 */
export const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Create new AbortController on mount
    abortControllerRef.current = new AbortController();

    return () => {
      // Cancel pending request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const createNewSignal = () => {
    // Cancel old request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create fresh AbortController for new request
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  return { signal: abortControllerRef.current?.signal, createNewSignal };
};
