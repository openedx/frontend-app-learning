import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';

import { Header } from '../course-header';
import PageLoading from '../generic/PageLoading';

import messages from './messages';
import LoadedTabPage from './LoadedTabPage';
import LearningToast from '../toast/LearningToast';
import { toggleResetDatesToast } from '../course-home/data/slice';
import { COURSE_LOADED, COURSE_LOADING } from '../active-course';

function TabPage({
  intl,
  courseStatus,
  ...passthroughProps
}) {
  const courseId = useSelector(state => state.courseHome.courseId || state.courseware.courseId);
  const {
    displayResetDatesToast,
  } = useSelector(state => state.courseHome);
  const dispatch = useDispatch();

  if (courseStatus === COURSE_LOADING) {
    return (
      <>
        <Header />
        <PageLoading
          srMessage={intl.formatMessage(messages.loading)}
        />
      </>
    );
  }

  if (courseStatus === COURSE_LOADED) {
    return (
      <>
        <LearningToast
          body={messages.datesResetSuccessBody}
          header={messages.datesResetSuccessHeader}
          link={`/course/${courseId}/dates`}
          onClose={() => dispatch(toggleResetDatesToast({ displayResetDatesToast: false }))}
          show={displayResetDatesToast}
        />
        <LoadedTabPage {...passthroughProps} />
      </>
    );
  }

  // courseStatus 'failed' and any other unexpected course status.
  return (
    <>
      <Header />
      <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
        {intl.formatMessage(messages.failure)}
      </p>
    </>
  );
}

TabPage.propTypes = {
  intl: intlShape.isRequired,
  courseStatus: PropTypes.string.isRequired,
};

export default injectIntl(TabPage);
