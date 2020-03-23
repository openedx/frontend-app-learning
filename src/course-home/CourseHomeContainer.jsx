import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import PageLoading from '../PageLoading';
import CourseHome from './CourseHome';
import { fetchCourse } from '../data';

function CourseHomeContainer(props) {
  const {
    intl,
    match,
  } = props;

  const dispatch = useDispatch();
  useEffect(() => {
    // The courseUsageKey from the URL is the course we WANT to load.
    dispatch(fetchCourse(match.params.courseUsageKey));
  }, [match.params.courseUsageKey]);

  // The courseUsageKey from the store is the course we HAVE loaded.  If the URL changes,
  // we don't want the application to adjust to it until it has actually loaded the new data.
  const {
    courseUsageKey,
    courseStatus,
  } = useSelector(state => state.courseware);

  return (
    <>
      {courseStatus === 'loaded' ? (
        <CourseHome
          courseUsageKey={courseUsageKey}
        />
      ) : (
        <PageLoading
          srMessage={intl.formatMessage(messages['learn.loading.outline'])}
        />
      )}
    </>
  );
}

CourseHomeContainer.propTypes = {
  intl: intlShape.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseUsageKey: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default injectIntl(CourseHomeContainer);
