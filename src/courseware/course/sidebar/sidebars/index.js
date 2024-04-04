import * as notifications from './notifications';
import * as discussions from './discussions';

export const SIDEBARS = {
  [notifications.ID]: {
    ID: notifications.ID,
    Sidebar: notifications.Sidebar,
    Trigger: notifications.Trigger,
    LAYOUT: notifications.LAYOUT,
  },
  [discussions.ID]: {
    ID: discussions.ID,
    Sidebar: discussions.Sidebar,
    Trigger: discussions.Trigger,
    LAYOUT: notifications.LAYOUT,
  },
};

export const SIDEBAR_ORDER = [
  discussions.ID,
  notifications.ID,
];

export const COURSE_OUTLINE_SIDEBAR_ID = 'COURSE_OUTLINE_SIDEBAR';

export const extendSidebars = (key, value) => {
  SIDEBARS[key] = value;
};

export const checkIsSidebarAvailable = (id) => Object.keys(SIDEBARS).includes(id);
