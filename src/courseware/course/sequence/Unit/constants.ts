export const modelKeys = {
  units: 'units',
  coursewareMeta: 'coursewareMeta',
} as const;

export const views = {
  student: 'student_view',
  public: 'public_view',
} as const;

export const loadingState = 'loading';

export const messageTypes = {
  modal: 'plugin.modal',
  resize: 'plugin.resize',
  videoFullScreen: 'plugin.videoFullScreen',
  autoAdvance: 'plugin.autoAdvance',
} as const;

export default {
  modelKeys,
  views,
  loadingState,
  messageTypes,
};
