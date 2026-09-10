import { useState, useEffect } from 'react';

export default function FloatingScrollButton() {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#9beb46] hover:text-slate-900 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}

export { FloatingScrollButton };
