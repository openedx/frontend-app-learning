import React, { type ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

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

interface TabPageProps {
  activeTabSlug: string;
  courseId?: string;
  courseStatus: StatusValue;
  metadataModel: string;
  unitId?: string;
  children?: ReactNode;
}

const TabPage = ({
  activeTabSlug,
  courseId,
  courseStatus,
  metadataModel,
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

  if (courseStatus === DENIED) {
    const redirectUrl = getAccessDeniedRedirectUrl(courseId, activeTabSlug, courseAccess, start);
    if (redirectUrl) {
      return (<Navigate to={redirectUrl} replace />);
    }
  }

  return (
    <TourProvider>
      {(courseStatus === LOADED || courseStatus === DENIED) && (
        <>
          <Toast
            action={toastContent?.action}
            closeLabel={intl.formatMessage(genericMessages.close)}
            onClose={closeToast}
            show={isToastOpen}
          >
            {toastContent?.message ?? ''}
          </Toast>
          {metadataModel === 'courseHomeMeta' && (<LaunchCourseHomeTourButton srOnly />)}
        </>
      )}

      <HeaderSlot courseOrg={org} courseNumber={number} courseTitle={title} />

      {courseStatus === LOADING && (
        <PageLoading srMessage={intl.formatMessage(messages.loading)} />
      )}

      {(courseStatus === LOADED || courseStatus === DENIED) && courseId && (
        <LoadedTabPage
          activeTabSlug={activeTabSlug}
          courseId={courseId}
          metadataModel={metadataModel}
          unitId={unitId}
        >
          {children}
        </LoadedTabPage>
      )}

      {/* courseStatus 'failed' and any other unexpected course status. */}
      {courseStatus !== LOADING && courseStatus !== LOADED && courseStatus !== DENIED && (
        <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
          {errorMessage || intl.formatMessage(messages.failure)}
        </p>
      )}
      <FooterSlot />
    </TourProvider>
  );
};

export default TabPage;
