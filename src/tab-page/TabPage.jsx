import React from 'react';
import PropTypes from 'prop-types';
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

import genericMessages from '../generic/messages';
import messages from './messages';
import LoadedTabPage from './LoadedTabPage';
import LaunchCourseHomeTourButton from '../product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton';
import { TourProvider } from '../product-tours/TourContext';

const TabPage = (props) => {
  const intl = useIntl();
  const {
    activeTabSlug,
    courseId,
    courseStatus,
    metadataModel,
  } = props;
  const {
    errorMessage: courseHomeErrorMessage,
  } = useSelector(state => state.courseHome);
  const {
    errorMessage: coursewareErrorMessage,
  } = useSelector(state => state.courseware);
  const errorMessage = courseHomeErrorMessage || coursewareErrorMessage;
  const { toastContent, isToastOpen, closeToast } = useToast();
  const {
    courseAccess,
    number,
    org,
    start,
    title,
  } = useModel('courseHomeMeta', courseId);

  if (courseStatus === 'denied') {
    const redirectUrl = getAccessDeniedRedirectUrl(courseId, activeTabSlug, courseAccess, start);
    if (redirectUrl) {
      return (<Navigate to={redirectUrl} replace />);
    }
  }

  return (
    <TourProvider>
      {['loaded', 'denied'].includes(courseStatus) && (
        <>
          <Toast
            action={toastContent?.action ?? null}
            closeLabel={intl.formatMessage(genericMessages.close)}
            onClose={closeToast}
            show={isToastOpen}
          >
            {toastContent?.message}
          </Toast>
          {metadataModel === 'courseHomeMeta' && (<LaunchCourseHomeTourButton srOnly />)}
        </>
      )}

      <HeaderSlot courseOrg={org} courseNumber={number} courseTitle={title} />

      {courseStatus === 'loading' && (
        <PageLoading srMessage={intl.formatMessage(messages.loading)} />
      )}

      {['loaded', 'denied'].includes(courseStatus) && (
        <LoadedTabPage {...props} />
      )}

      {/* courseStatus 'failed' and any other unexpected course status. */}
      {(!['loading', 'loaded', 'denied'].includes(courseStatus)) && (
        <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
          {errorMessage || intl.formatMessage(messages.failure)}
        </p>
      )}
      <FooterSlot />
    </TourProvider>
  );
};

TabPage.defaultProps = {
  courseId: null,
  unitId: null,
};

TabPage.propTypes = {
  activeTabSlug: PropTypes.string.isRequired,
  courseId: PropTypes.string,
  courseStatus: PropTypes.string.isRequired,
  metadataModel: PropTypes.string.isRequired,
  unitId: PropTypes.string,
};

export default TabPage;
