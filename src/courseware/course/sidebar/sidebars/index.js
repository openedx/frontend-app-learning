import * as discussions from './discussions';

export const SIDEBARS = {
  [discussions.ID]: {
    ID: discussions.ID,
    Sidebar: discussions.Sidebar,
    Trigger: discussions.Trigger,
  },
};

export const SIDEBAR_ORDER = [
  discussions.ID,
];
