import * as notifications from './notifications';
import * as discussions from './discussions';
import * as courseOutline from './course-outline';

export const SIDEBARS = {
  [courseOutline.ID]: {
    ID: courseOutline.ID,
    Sidebar: courseOutline.Sidebar,
    LAYOUT: courseOutline.LAYOUT,
  },
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
