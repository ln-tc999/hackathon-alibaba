import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type AppView = 'landing' | 'chat' | 'workflow' | 'schedule';

/**
 * Hook untuk manage Lenis smooth scroll
 * - Aktif hanya saat view = 'landing'
 * - Destroy saat view berubah
 */
export function useLenisScroll(view: AppView) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (view === 'landing') {
      // Enable Lenis for landing page
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      }
      rafRef.current = requestAnimationFrame(raf);

      // Refresh GSAP ScrollTrigger
      ScrollTrigger.refresh();
    } else {
      // Disable Lenis for app views
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      
      // Kill all ScrollTrigger animations
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      
      // Reset scroll
      window.scrollTo(0, 0);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [view]);
}
