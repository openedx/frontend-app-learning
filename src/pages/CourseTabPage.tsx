import { getSiteConfig, getUrlByRouteRole, useIntl } from '@openedx/frontend-base';
import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';

import { learningRole } from '@src/constants';
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { getActiveTabTitle } from '@src/course-tabs/utils';
import { getAccessDeniedRedirectUrl } from '@src/shared/access';
import messages from './messages';

interface Props {
  courseId: string;
  // The tab this page shows, as the course metadata's tabs name it.
  tabSlug: string;
  // The document title, when the page has a better one than its tab's name (the courseware's unit breadcrumbs).
  title?: string;
  children: ReactNode;
}

/*
 * The page jobs of a route that shows a course tab: once the course metadata has loaded, it sets the document title
 * and sends a learner denied access on to where they belong. Until then, and when access is granted (or denied with
 * nowhere to go, as on the outline), it renders the tab. The query shares the tab's key, so it makes no request of
 * its own.
 */
const CourseTabPage = ({
  courseId, tabSlug, title, children,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: metadata } = useCourseHomeMeta(courseId);

  if (metadata && !metadata.courseAccess?.hasAccess) {
    const redirectUrl = getAccessDeniedRedirectUrl(courseId, tabSlug, metadata.courseAccess);
    if (redirectUrl) {
      return (<Navigate to={`${getUrlByRouteRole(learningRole)}${redirectUrl}`} replace />);
    }
  }

  let documentTitle = title;
  if (!documentTitle && metadata) {
    const { siteName } = getSiteConfig();
    const tabTitle = getActiveTabTitle(metadata.tabs, tabSlug);
    documentTitle = tabTitle
      ? formatMessage(messages['learning.courseTab.page.title'], { tabTitle, courseTitle: metadata.title, siteName })
      : formatMessage(messages['learning.course.page.title'], { courseTitle: metadata.title, siteName });
  }

  // The Helmet is there from the first render, so that the one title set further in (the course exit's) is newer and
  // wins: Helmet goes by the order its instances mounted in. Until there is a title, Main's fallback shows.
  return (
    <>
      <Helmet>
        {documentTitle && (<title>{documentTitle}</title>)}
      </Helmet>
      {children}
    </>
  );
};

export default CourseTabPage;
