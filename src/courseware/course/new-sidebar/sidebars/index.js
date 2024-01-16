import * as discussionsNotifications from './discussions-notifications';

export const SIDEBARS = {
  [discussionsNotifications.ID]: {
    ID: discussionsNotifications.ID,
    Sidebar: discussionsNotifications.Sidebar,
    Trigger: discussionsNotifications.Trigger,
  },
};

export const SIDEBAR_ORDER = [
  discussionsNotifications.ID,
];
