import React, { type ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';

import { Toast } from '@openedx/paragon';
import { FooterSlot } from '@edx/frontend-component-footer';
import HeaderSlot from '../plugin-slots/HeaderSlot';
import PageLoading from '../generic/PageLoading';
import { getAccessDeniedRedirectUrl } from '../shared/access';
import { useModel } from '../generic/model-store';
import { useToast } from '../generic/ToastContext';
import type { RootState } from '../store';
import {
  LOADING, LOADED, DENIED, type StatusValue,
} from '../constants';

import genericMessages from '../generic/messages';
import messages from './messages';
import LoadedTabPage from './LoadedTabPage';
import LaunchCourseHomeTourButton from '../product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton';
import { TourProvider } from '../product-tours/TourContext';

// A converted tab hands TabPage its metadata + tab-data queries and lets TabPage derive
// the view; not-yet-converted (Redux) callers still pass a plain status string. The
// metadata query is typed to only the field this file reads, not the whole (untyped) shape.
export type CourseStatus = StatusValue | {
  metadataQuery: UseQueryResult<{ courseAccess?: { hasAccess: boolean } }>;
  tabDataQuery?: UseQueryResult;
};

export interface TabPageProps {
  activeTabSlug: string;
  courseId?: string;
  courseStatus: CourseStatus;
  unitId?: string;
  children?: ReactNode;
}

interface TabView {
  isLoading: boolean;
  isError: boolean;
  isDenied: boolean;
}

const deriveView = (courseStatus: CourseStatus): TabView => {
  const view = { isLoading: false, isError: false, isDenied: false };

  // Transitional: legacy Redux callers pass a resolved status string. This branch and the
  // StatusValue union member go when courseware — the last string caller — converts.
  if (typeof courseStatus === 'string') {
    if (courseStatus === LOADING) { return { ...view, isLoading: true }; }
    if (courseStatus === DENIED) { return { ...view, isDenied: true }; }
    if (courseStatus === LOADED) { return view; }
    return { ...view, isError: true };
  }

  // Access is read from the metadata query, resolved before tabData is considered.
  const { metadataQuery, tabDataQuery } = courseStatus;
  if (metadataQuery.isError) { return { ...view, isError: true }; }
  if (metadataQuery.isPending) { return { ...view, isLoading: true }; }
  if (tabDataQuery?.isPending) { return { ...view, isLoading: true }; }
  if (!metadataQuery.data?.courseAccess?.hasAccess) { return { ...view, isDenied: true }; }
  if (tabDataQuery?.isError) { return { ...view, isError: true }; }
  return view;
};

const TabPage = ({
  activeTabSlug,
  courseId,
  courseStatus,
  unitId,
  children,
}: TabPageProps) => {
  const intl = useIntl();
  const {
    errorMessage: courseHomeErrorMessage,
  } = useSelector((state: RootState) => state.courseHome);
  const {
    errorMessage: coursewareErrorMessage,
  } = useSelector((state: RootState) => state.courseware);
  const errorMessage = courseHomeErrorMessage || coursewareErrorMessage;
  const { toastContent, isToastOpen, closeToast } = useToast();
  const {
    courseAccess,
    number,
    org,
    start,
    title,
  } = useModel('courseHomeMeta', courseId);

  const { isLoading, isError, isDenied } = deriveView(courseStatus);

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

  const renderError = () => (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {errorMessage || intl.formatMessage(messages.failure)}
    </p>
  );

  return (
    <TourProvider>
      {shouldRenderContent && renderToast()}
      {shouldRenderContent && renderSrOnlyTourButton()}
      <HeaderSlot courseOrg={org} courseNumber={number} courseTitle={title} />
      {isLoading && renderLoading()}
      {shouldRenderContent && renderLoadedTabPage()}
      {isError && renderError()}
      <FooterSlot />
    </TourProvider>
  );
};

export default TabPage;
