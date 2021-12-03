import * as notifications from './notifications';
import * as discusssions from './discussions';

export const SIDEBARS = {
  [notifications.ID]: {
    ID: notifications.ID,
    Sidebar: notifications.Sidebar,
    Trigger: notifications.Trigger,
  },
  [discusssions.ID]: {
    ID: discusssions.ID,
    Sidebar: discusssions.Sidebar,
    Trigger: discusssions.Trigger,
  },
};

export const SIDEBAR_ORDER = [
  discusssions.ID,
  notifications.ID,
];
