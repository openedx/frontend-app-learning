import * as notifications from './notifications';
import * as discussions from './discussions';

export const SIDEBARS = {
  [notifications.ID]: {
    ID: notifications.ID,
    Sidebar: notifications.Sidebar,
    Trigger: notifications.Trigger,
  },
  [discussions.ID]: {
    ID: discussions.ID,
    Sidebar: discussions.Sidebar,
    Trigger: discussions.Trigger,
  },
};

export const SIDEBAR_ORDER = [
  discussions.ID,
  notifications.ID,
];
