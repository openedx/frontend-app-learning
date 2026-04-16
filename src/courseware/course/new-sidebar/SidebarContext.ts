import React from 'react';
import type { WIDGETS } from '@src/constants';
import type { SIDEBARS } from './sidebars';

export type SidebarId = keyof typeof SIDEBARS;
export type WidgetId = keyof typeof WIDGETS;
export type UpgradeNotificationState = (
  | 'accessLastHour'
  | 'accessHoursLeft'
  | 'accessDaysLeft'
  | 'FPDdaysLeft'
  | 'FPDLastHour'
  | 'accessDateView'
  | 'PastExpirationDate'
);

export interface SidebarContextData {
  toggleSidebar: (sidebarId?: SidebarId | null, widgetId?: WidgetId | null) => void;
  onNotificationSeen: () => void;
  setNotificationStatus: React.Dispatch<'active' | 'inactive'>;
  currentSidebar: SidebarId | null;
  notificationStatus: 'active' | 'inactive';
  upgradeNotificationCurrentState: UpgradeNotificationState;
  setUpgradeNotificationCurrentState: React.Dispatch<UpgradeNotificationState>;
  shouldDisplaySidebarOpen: boolean;
  shouldDisplayFullScreen: boolean;
  courseId: string;
  unitId: string;
  hideDiscussionbar: boolean;
  hideNotificationbar: boolean;
  isNotificationbarAvailable: boolean;
  isDiscussionbarAvailable: boolean;
}

const SidebarContext = React.createContext<SidebarContextData>({} as SidebarContextData);

export default SidebarContext;
