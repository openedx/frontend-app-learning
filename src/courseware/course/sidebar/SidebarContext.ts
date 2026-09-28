import {
  createContext, useContext, type ComponentType, type ReactNode,
} from 'react';

import type { CourseHomeMeta } from '@src/course-home/data/apiHooks';
import type { CoursewareMeta, DiscussionTopic } from '@src/courseware/data/apiHooks';

export interface SidebarWidgetContext {
  courseId: string;
  unitId: string;
  course: CourseHomeMeta & CoursewareMeta;
  unit: Partial<DiscussionTopic>;
}

export interface SidebarWidget {
  id: string;
  priority: number;
  Sidebar: ComponentType;
  Trigger: ComponentType<{ onClick: () => void }>;
  Provider?: ComponentType<{ children: ReactNode }>;
  isAvailable?: (context: SidebarWidgetContext) => boolean;
  enabled?: boolean;
}

export interface SidebarRegistryEntry {
  ID: string;
  Sidebar: ComponentType;
  Trigger: ComponentType<{ onClick: () => void }>;
  isAvailable?: (context: SidebarWidgetContext) => boolean;
}

export interface SidebarContextValue {
  currentSidebar: string | null;
  initialSidebar: string | null;
  toggleSidebar: (sidebarId: string) => void;
  shouldDisplaySidebarOpen: boolean;
  shouldDisplayFullScreen: boolean;
  courseId: string;
  unitId: string;
  SIDEBARS: Record<string, SidebarRegistryEntry>;
  SIDEBAR_ORDER: string[];
  availableSidebarIds: string[];
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;
