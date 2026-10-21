export interface TabMetadata {
  tabId: string;
  title: string;
  url: string;
}

const getTab = (tabs: TabMetadata[] | undefined, tabId: string) => tabs?.find(tab => tab.tabId === tabId);

export const getDatesTabUrl = (tabs?: TabMetadata[]) => getTab(tabs, 'dates')?.url;
export const getProgressTabUrl = (tabs?: TabMetadata[]) => getTab(tabs, 'progress')?.url;
export const hasDiscussionTab = (tabs?: TabMetadata[]) => !!getTab(tabs, 'discussion');

export const getCourseOutlineUrl = (tabs?: TabMetadata[]) => getTab(tabs, 'courseware')?.url;

export const isActiveTab = (slug: string, activeTabSlug?: string) => {
  if (activeTabSlug === slug) {
    return true;
  }

  // Course content renders at /course/:courseId/:sequenceId/:unitId and carries the slug `courseware`;
  // the course outline renders at /course/:courseId/home and carries `outline`. Users see one "Course" tab.
  if (activeTabSlug === 'outline' && slug === 'courseware') {
    return true;
  }

  return false;
};

export const getActiveTabTitle = (tabs?: TabMetadata[], activeTabSlug?: string) => (
  tabs?.find(tab => isActiveTab(tab.tabId, activeTabSlug))?.title
);
