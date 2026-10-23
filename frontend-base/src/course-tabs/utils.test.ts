import {
  getActiveTabTitle,
  getCourseOutlineUrl,
  getDatesTabUrl,
  getProgressTabUrl,
  hasDiscussionTab,
  isActiveTab,
} from './utils';

const courseTab = { tabId: 'courseware', title: 'Course', url: 'http://localhost/course' };
const datesTab = { tabId: 'dates', title: 'Dates', url: 'http://localhost/dates' };
const discussionTab = { tabId: 'discussion', title: 'Discussion', url: 'http://localhost/discussion' };
const progressTab = { tabId: 'progress', title: 'Progress', url: 'http://localhost/progress' };
const tabs = [courseTab, datesTab, discussionTab, progressTab];

describe('isActiveTab', () => {
  it.each(['courseware', 'outline'])('marks the Course tab active on the %s page', (activeTabSlug) => {
    expect(isActiveTab(courseTab.tabId, activeTabSlug)).toBe(true);
  });

  it('does not mark the Course tab active on another page', () => {
    expect(isActiveTab(courseTab.tabId, 'dates')).toBe(false);
  });

  it('matches every other tab on its own id only', () => {
    expect(isActiveTab(datesTab.tabId, 'dates')).toBe(true);
    expect(isActiveTab(datesTab.tabId, 'outline')).toBe(false);
  });

  it('marks nothing active before the page is known', () => {
    expect(isActiveTab(courseTab.tabId, undefined)).toBe(false);
    expect(isActiveTab(datesTab.tabId, undefined)).toBe(false);
  });
});

describe('getActiveTabTitle', () => {
  it.each(['courseware', 'outline'])('returns the Course tab title on the %s page', (activeTabSlug) => {
    expect(getActiveTabTitle(tabs, activeTabSlug)).toBe(courseTab.title);
  });

  it('returns an ordinary tab title on its own page', () => {
    expect(getActiveTabTitle(tabs, 'progress')).toBe(progressTab.title);
  });

  it('returns undefined on a page no tab claims', () => {
    expect(getActiveTabTitle(tabs, 'lti_live')).toBeUndefined();
    expect(getActiveTabTitle(undefined, 'outline')).toBeUndefined();
  });
});

describe.each([
  ['getCourseOutlineUrl', getCourseOutlineUrl, courseTab],
  ['getDatesTabUrl', getDatesTabUrl, datesTab],
  ['getProgressTabUrl', getProgressTabUrl, progressTab],
] as const)('%s', (_name, getUrl, expected) => {
  it('returns its tab\'s url', () => {
    expect(getUrl(tabs)).toBe(expected.url);
  });

  it('returns undefined when the course has no such tab', () => {
    expect(getUrl(tabs.filter(tab => tab !== expected))).toBeUndefined();
  });

  it('returns undefined before the tabs have loaded', () => {
    expect(getUrl(undefined)).toBeUndefined();
  });
});

describe('hasDiscussionTab', () => {
  it('is true when the course has a discussion tab', () => {
    expect(hasDiscussionTab(tabs)).toBe(true);
  });

  it('is false when it does not', () => {
    expect(hasDiscussionTab([datesTab])).toBe(false);
  });

  it('is false before the tabs have loaded', () => {
    expect(hasDiscussionTab(undefined)).toBe(false);
  });
});
