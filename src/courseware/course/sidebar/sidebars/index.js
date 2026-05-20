import * as notifications from './notifications';
import * as discussions from './discussions';
import * as roomanTutor from './rooman-tutor';

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
  // Rooman addition — in-course AI tutor. New custom sidebar, not from
  // upstream Open edX. When rebasing this file across releases, keep
  // this entry intact — it's the entire Layer-3 sidebar wiring.
  [roomanTutor.ID]: {
    ID: roomanTutor.ID,
    Sidebar: roomanTutor.Sidebar,
    Trigger: roomanTutor.Trigger,
  },
};

export const SIDEBAR_ORDER = [
  // Rooman tutor sits at the top so learners see the icon first.
  roomanTutor.ID,
  discussions.ID,
  notifications.ID,
];
