import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce state updates.
 * Delays state updates until user stops interacting.
 * Prevents API calls from firing on every keystroke/change.
 * 
 * Example: Search input triggers API only after 500ms of inactivity
 * @param value - The value to debounce
 * @param delay - Milliseconds to wait before updating (default: 500)
 * @returns Debounced value
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay completes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
