import { useState, useEffect, useCallback } from 'react';

export type AppView = 'landing' | 'chat' | 'workflow' | 'schedule';

interface UseViewSyncReturn {
  view: AppView;
  setView: (view: AppView) => void;
}

/**
 * Hook untuk sync view state dengan Astro landing page
 * - Mendengarkan event viewChange dari Astro
 * - Memanggil window.__setView saat view berubah
 */
export function useViewSync(): UseViewSyncReturn {
  const [view, setViewState] = useState<AppView>('landing');

  // Sync view changes to Astro landing page
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__setView) {
      (window as any).__setView(view);
    }
    if (typeof window !== 'undefined') {
      (window as any).__currentView = view;
    }
  }, [view]);

  // Listen for view changes from Astro (button clicks)
  useEffect(() => {
    const handleViewChange = (event: CustomEvent<{ view: AppView }>) => {
      setViewState(event.detail.view);
    };

    window.addEventListener('viewChange', handleViewChange as EventListener);

    return () => {
      window.removeEventListener('viewChange', handleViewChange as EventListener);
    };
  }, []);

  const setView = useCallback((newView: AppView) => {
    setViewState(newView);
  }, []);

  return { view, setView };
}
