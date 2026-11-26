import React, { type ReactNode } from 'react';
import { useIntl } from '@openedx/frontend-base';
import type { UseQueryResult } from '@tanstack/react-query';

import { Toast } from '@openedx/paragon';
import { getErrorDetail } from '@src/data/http-error';
import PageLoading from '../generic/PageLoading';
import type { CourseHomeMeta } from '../course-home/data/api';
import { useToast } from '../generic/ToastContext';

import genericMessages from '../generic/messages';
import messages from './messages';
import LoadedTabPage, { type FrameContentProps } from './LoadedTabPage';

// A tab hands TabPage its metadata + tab-data queries and lets TabPage derive the view; a tab
// whose data comes from more than one query passes them as `tabDataQueries`.
export type CourseStatus = {
  metadataQuery: UseQueryResult<CourseHomeMeta>;
} & (
  | { tabDataQuery?: UseQueryResult; tabDataQueries?: never }
  | { tabDataQuery?: never; tabDataQueries: UseQueryResult[] }
);

export interface TabPageProps extends FrameContentProps {
  courseId?: string;
  courseStatus: CourseStatus;
  // Rendered once loaded, above everything else the frame renders but the toast (the outline's screen-reader-only
  // tour button goes here).
  aboveContent?: ReactNode;
  // The tab shows itself to a learner denied access (the outline does). Otherwise the frame renders nothing for them:
  // on Learning's routes, the page sends them elsewhere.
  showWhenDenied?: boolean;
  children?: ReactNode;
}

interface TabView {
  isLoading: boolean;
  isError: boolean;
  isDenied: boolean;
  errorDetails?: string[];
}

const getErrorDetails = (queries: { error: unknown }[]): string[] => {
  const details = queries.flatMap((query) => getErrorDetail(query.error) || []);
  return [...new Set(details)];
};

const deriveView = (courseStatus: CourseStatus): TabView => {
  const view = { isLoading: false, isError: false, isDenied: false };

  // Access is read from the metadata query, resolved before tabData is considered.
  const {
    metadataQuery,
    tabDataQuery,
    tabDataQueries = tabDataQuery ? [tabDataQuery] : [],
  } = courseStatus;
  if (metadataQuery.isError) {
    return { ...view, isError: true, errorDetails: getErrorDetails([metadataQuery]) };
  }
  if (metadataQuery.isPending) {
    return { ...view, isLoading: true };
  }
  if (tabDataQueries.some((query) => query.isPending)) {
    return { ...view, isLoading: true };
  }
  if (!metadataQuery.data?.courseAccess?.hasAccess) {
    return { ...view, isDenied: true };
  }
  const failedQueries = tabDataQueries.filter((query) => query.isError);
  if (failedQueries.length > 0) {
    return { ...view, isError: true, errorDetails: getErrorDetails(failedQueries) };
  }
  return view;
};

const TabPage = ({
  courseId,
  courseStatus,
  aboveContent = null,
  showWhenDenied = false,
  children,
  ...frameContentProps
}: TabPageProps) => {
  const intl = useIntl();
  const { toastContent, isToastOpen, closeToast } = useToast();

  const {
    isLoading, isError, isDenied, errorDetails,
  } = deriveView(courseStatus);

  // The tab can see the course metadata before the page above it does, so a denied learner may reach the frame
  // before the page has redirected them: render nothing for them, as the redirect did here before.
  if (isDenied && !showWhenDenied) {
    return null;
  }

  // The page renders once metadata resolves without error, and for a denied learner (a failed tab-data query
  // notwithstanding) when the tab shows itself to them.
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

  const renderLoading = () => (
    <PageLoading srMessage={intl.formatMessage(messages.loading)} />
  );

  const renderLoadedTabPage = () => {
    if (!courseId) {
      return null;
    }
    return (
      <LoadedTabPage courseId={courseId} {...frameContentProps}>
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
    <>
      {shouldRenderContent && renderToast()}
      {shouldRenderContent && aboveContent}
      {isLoading && renderLoading()}
      {shouldRenderContent && renderLoadedTabPage()}
      {isError && renderError()}
    </>
  );
};

export default TabPage;
