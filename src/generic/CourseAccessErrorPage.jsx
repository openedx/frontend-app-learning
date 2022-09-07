import React, { useEffect } from 'react';
import { LearningHeader as Header } from '@edx/frontend-component-header';
import Footer from '@edx/frontend-component-footer';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import useActiveEnterpriseAlert from '../alerts/active-enteprise-alert';
import { AlertList } from './user-messages';
import { fetchDiscussionTab } from '../course-home/data/thunks';
import { LOADED, LOADING } from '../course-home/data/slice';
import PageLoading from './PageLoading';
import messages from '../tab-page/messages';

function CourseAccessErrorPage({ intl }) {
  const { courseId } = useParams();

  const dispatch = useDispatch();
  const activeEnterpriseAlert = useActiveEnterpriseAlert(courseId);
  useEffect(() => {
    dispatch(fetchDiscussionTab(courseId));
  }, [courseId]);

  const {
    courseStatus,
  } = useSelector(state => state.courseHome);

  if (courseStatus === LOADING) {
    return (
      <>
        <Header />
        <PageLoading
          srMessage={intl.formatMessage(messages.loading)}
        />
        <Footer />
      </>
    );
  }
  if (courseStatus === LOADED) {
    return (<Redirect to={`/redirect/home/${courseId}`} />);
  }
  return (
    <>
      <Header />
      <main id="main-content" className="container my-5 text-center" data-testid="access-denied-main">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...activeEnterpriseAlert,
          }}
        />
      </main>
      <Footer />
    </>
  );
}

CourseAccessErrorPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseAccessErrorPage);
