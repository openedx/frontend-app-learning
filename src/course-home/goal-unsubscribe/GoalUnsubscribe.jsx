import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';

import HeaderSlot from '../../plugin-slots/HeaderSlot';
import PageLoading from '../../generic/PageLoading';
import { unsubscribeFromCourseGoal } from '../data/api';

import messages from './messages';
import ResultPage from './ResultPage';

const GoalUnsubscribe = () => {
  const intl = useIntl();
  const { token } = useParams();
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});

  // We don't need to bother with redux for this simple page. We're not sharing state with other pages at all.
  useEffect(() => {
    unsubscribeFromCourseGoal(token)
      .then(
        (result) => {
          setIsLoading(false);
          setData(result.data);
        },
        () => {
          setIsLoading(false);
          setError(true);
        },
      );
    // We unfortunately have no information about the user, course, org, or really anything
    // as visiting this page is allowed to be done anonymously and without the context of the course.
    // The token can be used to connect a user and course, it will just require some post-processing
    sendTrackEvent('edx.ui.lms.goal.unsubscribe', { token });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // deps=[] to only run once

  return (
    <>
      <HeaderSlot showUserDropdown={false} />
      <main id="main-content" className="container my-5 text-center">
        {isLoading && (
          <PageLoading srMessage={`${intl.formatMessage(messages.loading)}`} />
        )}
        {!isLoading && (
          <ResultPage error={error} courseTitle={data.courseTitle} />
        )}
      </main>
    </>
  );
};

export default GoalUnsubscribe;
