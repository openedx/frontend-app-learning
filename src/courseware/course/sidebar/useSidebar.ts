import { createContext, useContext } from 'react';

// The context alone, apart from SidebarProvider: the auxiliary sidebar slots' layouts read it, and SidebarProvider
// reads those slots, so keeping the two in one module would make it import itself through the slots.

export interface SidebarContextValue {
  currentSidebar: string | null;
  initialSidebar: string | null;
  toggleSidebar: (sidebarId: string | null) => void;
  shouldDisplaySidebarOpen: boolean;
  shouldDisplayFullScreen: boolean;
  courseId: string;
  unitId: string;
  availableSidebarIds: string[];
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
