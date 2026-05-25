import { useState, useEffect } from "react";
import { HiArrowUp } from "react-icons/hi";

export default function BackToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll for back-to-top button with requestAnimationFrame throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowBackToTop(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    showBackToTop && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-black hover:bg-gray-800 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Back to top"
        title="Back to top"
      >
        <HiArrowUp className="w-5 h-5" />
      </button>
    )
  );
}