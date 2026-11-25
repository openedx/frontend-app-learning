import { mergeAppConfig } from '@openedx/frontend-base';

import { appId } from '@src/constants';
import { getLatestDueDateInFuture, showUngradedAssignments } from './utils';

describe('showUngradedAssignments', () => {
  afterEach(() => {
    mergeAppConfig(appId, { SHOW_UNGRADED_ASSIGNMENT_PROGRESS: false });
  });

  it.each([
    [true, true],
    ['true', true],
    [false, false],
    ['false', false],
    [null, false],
  ])('reads SHOW_UNGRADED_ASSIGNMENT_PROGRESS=%p from the app config as %p', (value, expected) => {
    mergeAppConfig(appId, { SHOW_UNGRADED_ASSIGNMENT_PROGRESS: value });

    expect(showUngradedAssignments()).toBe(expected);
  });
});

describe('getLatestDueDateInFuture', () => {
  const past = '2000-01-01T00:00:00Z';
  const soon = '2999-01-01T00:00:00Z';
  const later = '2999-06-01T00:00:00Z';
  const summary = (...dates: (string | null)[]) => dates.map((lastGradePublishDate) => ({ lastGradePublishDate }));

  it('returns null when no assignment type has a grade publish date in the future', () => {
    expect(getLatestDueDateInFuture(summary(null, past))).toBeNull();
    expect(getLatestDueDateInFuture([])).toBeNull();
  });

  it('returns the latest grade publish date in the future, wherever it sits in the list', () => {
    expect(getLatestDueDateInFuture(summary(past, soon, later, null))).toBe(later);
    expect(getLatestDueDateInFuture(summary(later, soon))).toBe(later);
  });
});
