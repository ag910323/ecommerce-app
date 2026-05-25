import React, { useState, useEffect, useCallback } from 'react';
import { HiArrowUp } from 'react-icons/hi';

/**
 * COMPLETELY ISOLATED BackToTopButton Component
 * 
 * Critical Performance Fix:
 * - Lives in SEPARATE component with own state
 * - Parent (ShopPage) does NOT re-render when scroll state changes
 * - Scroll listener is attached to THIS component only, not parent
 * - Prevents cascading re-renders from scroll events
 * 
 * This was a MAJOR source of lag in the original design
 */

// Throttle utility for scroll listener
const throttle = (fn: () => void, wait: number) => {
  let lastCall = 0;
  return () => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn();
    }
  };
};

export const BackToTopButton = React.memo(() => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll listener: ISOLATED to this component
  // Does NOT affect parent ShopPage re-renders
  useEffect(() => {
    const throttledScroll = throttle(() => {
      setShowBackToTop(window.scrollY > 600);
    }, 200);
    
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  if (!showBackToTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-colors duration-300 z-50"
      aria-label="Back to top"
    >
      <HiArrowUp className="w-5 h-5" />
    </button>
  );
});

BackToTopButton.displayName = 'BackToTopButton';
