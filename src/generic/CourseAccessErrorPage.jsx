import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import FooterSlot from '@openedx/frontend-slot-footer';
import { LOADED, LOADING } from '@src/constants';
import HeaderSlot from '../plugin-slots/HeaderSlot';
import useActiveEnterpriseAlert from '../alerts/active-enteprise-alert';
import { AlertList } from './user-messages';
import { fetchDiscussionTab } from '../course-home/data/thunks';
import PageLoading from './PageLoading';
import messages from '../tab-page/messages';

const CourseAccessErrorPage = () => {
  const intl = useIntl();
  const { courseId } = useParams();

  const dispatch = useDispatch();
  const activeEnterpriseAlert = useActiveEnterpriseAlert(courseId);
  useEffect(() => {
    dispatch(fetchDiscussionTab(courseId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const {
    courseStatus,
  } = useSelector(state => state.courseHome);

  if (courseStatus === LOADING) {
    return (
      <>
        <HeaderSlot />
        <PageLoading
          srMessage={intl.formatMessage(messages.loading)}
        />
        <FooterSlot />
      </>
    );
  }
  if (courseStatus === LOADED) {
    return <Navigate to={`/redirect/home/${courseId}`} replace />;
  }
  return (
    <>
      <HeaderSlot />
      <main id="main-content" className="container my-5 text-center" data-testid="access-denied-main">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...activeEnterpriseAlert,
          }}
        />
      </main>
      <FooterSlot />
    </>
  );
};

export default CourseAccessErrorPage;
