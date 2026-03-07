import { useState, useCallback, useEffect } from 'react';

const SESSION_PREFIX = 'session_';
const STORAGE_KEY = 'vlowgen_current_session';

interface UseSessionIdReturn {
  sessionId: string;
  updateSessionId: (newId: string) => void;
  createNewSession: () => void;
}

/**
 * Hook untuk manage session ID dengan persistence
 * - Load dari localStorage saat mount
 * - Save ke localStorage saat berubah
 * - Generate new session ID
 */
export function useSessionId(): UseSessionIdReturn {
  const [sessionId, setSessionId] = useState<string>(() => {
    // Load from localStorage on mount (client-side only)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return saved;
      }
    }
    // Generate temporary session ID
    return `${SESSION_PREFIX}${Date.now()}`;
  });

  // Listen for sessionId changes from child components
  useEffect(() => {
    const handleSessionIdChange = (event: CustomEvent<{ sessionId: string }>) => {
      setSessionId(event.detail.sessionId);
    };

    window.addEventListener('sessionIdChange', handleSessionIdChange as EventListener);

    return () => {
      window.removeEventListener('sessionIdChange', handleSessionIdChange as EventListener);
    };
  }, []);

  const updateSessionId = useCallback((newId: string) => {
    setSessionId(newId);
    localStorage.setItem(STORAGE_KEY, newId);
  }, []);

  const createNewSession = useCallback(() => {
    const newSessionId = `${SESSION_PREFIX}${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    sessionId,
    updateSessionId,
    createNewSession,
  };
}
