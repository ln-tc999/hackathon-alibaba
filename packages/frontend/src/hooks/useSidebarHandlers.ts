import { useState, useCallback } from 'react';

interface UseSidebarHandlersReturn {
  rightSidebarOpen: boolean;
  mobileHistoryOpen: boolean;
  toggleRightSidebar: () => void;
  toggleMobileHistory: () => void;
  setRightSidebarOpen: (open: boolean) => void;
}

/**
 * Hook untuk manage sidebar state handlers
 */
export function useSidebarHandlers(): UseSidebarHandlersReturn {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen((prev) => !prev);
  }, []);

  const toggleMobileHistory = useCallback(() => {
    setMobileHistoryOpen((prev) => !prev);
  }, []);

  return {
    rightSidebarOpen,
    mobileHistoryOpen,
    toggleRightSidebar,
    toggleMobileHistory,
    setRightSidebarOpen,
  };
}
