import { lazy, Suspense, type ReactNode } from 'react';

import { useSidebar } from '@src/courseware/course/sidebar/useSidebar';

import { getDiscussionsSidebarUrl } from './urls';

// Loaded on first render: Learning registers this provider by default, so whatever its loader imports would
// otherwise load with the app, before any test's module mocks apply.
const DiscussionsTopicsLoader = lazy(() => import(/* webpackChunkName: "learning-discussions-sidebar" */ './DiscussionsTopicsLoader'));

/*
 * The widget's `Provider`: mounted for as long as the sidebar is, it loads the course's discussion topics, which the
 * availability check, the trigger and the panel all read. Nothing is loaded when nothing provides the discussions
 * sidebar role. The children never wait for the loader.
 */
const DiscussionsProvider = ({ children }: { children: ReactNode }) => {
  const { courseId, unitId } = useSidebar();
  const hasDiscussionsSidebar = getDiscussionsSidebarUrl(courseId, unitId) !== null;
  return (
    <>
      {hasDiscussionsSidebar && (
        <Suspense fallback={null}>
          <DiscussionsTopicsLoader />
        </Suspense>
      )}
      {children}
    </>
  );
};

export default DiscussionsProvider;
