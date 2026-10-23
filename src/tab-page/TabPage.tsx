import React, { type ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Navigate } from 'react-router-dom';

import { Toast } from '@openedx/paragon';
import { FooterSlot } from '@edx/frontend-component-footer';
import HeaderSlot from '../plugin-slots/HeaderSlot';
import { CourseInfoStripSlot } from '../plugin-slots/CourseInfoStripSlot';
import PageLoading from '../generic/PageLoading';
import { getAccessDeniedRedirectUrl } from '../shared/access';
import type { CourseHomeMeta } from '../course-home/data/apiHooks';
import { useToast } from '../generic/ToastContext';

import genericMessages from '../generic/messages';
import messages from './messages';
import LoadedTabPage from './LoadedTabPage';
import { deriveView, type TabStatus } from './utils';
import LaunchCourseHomeTourButton from '../product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton';
import { TourProvider } from '../product-tours/TourContext';

export type CourseStatus = TabStatus<CourseHomeMeta>;

export interface TabPageProps {
  activeTabSlug: string;
  courseId?: string;
  courseStatus: CourseStatus;
  unitId?: string;
  children?: ReactNode;
}

const TabPage = ({
  activeTabSlug,
  courseId,
  courseStatus,
  unitId,
  children,
}: TabPageProps) => {
  const intl = useIntl();
  const { toastContent, isToastOpen, closeToast } = useToast();
  const {
    courseAccess,
    number,
    org,
    start,
    title,
  }: Partial<CourseHomeMeta> = courseStatus.metadataQuery.data ?? {};

  const {
    isLoading, isError, isDenied, errorDetails,
  } = deriveView(courseStatus, (metadata) => !!metadata.courseAccess?.hasAccess);

  if (isDenied) {
    const redirectUrl = getAccessDeniedRedirectUrl(courseId, activeTabSlug, courseAccess, start);
    if (redirectUrl) {
      return (<Navigate to={redirectUrl} replace />);
    }
  }

  // The page renders once metadata resolves without error — loaded, or denied without a
  // redirect (the outline tab shows the page to denied learners).
  const shouldRenderContent = !isLoading && !isError;

  const renderToast = () => (
    <Toast
      action={toastContent?.action}
      closeLabel={intl.formatMessage(genericMessages.close)}
      onClose={closeToast}
      show={isToastOpen}
    >
      {toastContent?.message ?? ''}
    </Toast>
  );

  // The outline page renders a visible "launch tour" button deep in the DOM; no other tab
  // renders it. For screen-reader users we render a screen-reader-only copy above the header,
  // where it won't be buried (a11y rationale:
  // https://github.com/openedx/frontend-app-learning/pull/750#discussion_r755536879).
  const renderSrOnlyTourButton = () => {
    if (activeTabSlug !== 'outline') { return null; }
    return (<LaunchCourseHomeTourButton srOnly />);
  };

  const renderLoading = () => (
    <PageLoading srMessage={intl.formatMessage(messages.loading)} />
  );

  const renderLoadedTabPage = () => {
    if (!courseId) { return null; }
    return (
      <LoadedTabPage
        activeTabSlug={activeTabSlug}
        courseId={courseId}
        unitId={unitId}
      >
        {children}
      </LoadedTabPage>
    );
  };

  const renderError = () => {
    const errorMessages = errorDetails?.length ? errorDetails : [intl.formatMessage(messages.failure)];
    return (
      <div className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
        {errorMessages.map((errorMessage) => <p key={errorMessage}>{errorMessage}</p>)}
      </div>
    );
  };

  return (
    <TourProvider>
      {shouldRenderContent && renderToast()}
      {shouldRenderContent && renderSrOnlyTourButton()}
      <HeaderSlot courseOrg={org} courseNumber={number} courseTitle={title} />
      {shouldRenderContent && <CourseInfoStripSlot courseId={courseId} />}
      {isLoading && renderLoading()}
      {shouldRenderContent && renderLoadedTabPage()}
      {isError && renderError()}
      <FooterSlot />
    </TourProvider>
  );
};

export default TabPage;
