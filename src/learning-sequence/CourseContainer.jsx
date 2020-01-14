import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useLoadCourseStructure } from './data/hooks';
import messages from './messages';
import PageLoading from './PageLoading';
import Course from './course/Course';
import { history } from '@edx/frontend-platform';

function CourseContainer({
  courseUsageKey, sequenceId, unitId, intl,
}) {
  const { blocks, loaded, courseId } = useLoadCourseStructure(courseUsageKey);

  useEffect(() => {
    if (!sequenceId) {
      // TODO: This will not work right now.
      const { activeSequenceId } = blocks[courseId];
      history.push(`/course/${courseUsageKey}/${activeSequenceId}`);
    }
  }, [courseUsageKey, courseId, sequenceId]);

  if (!loaded || !sequenceId) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  return (
    <Course
      courseUsageKey={courseUsageKey}
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      models={blocks}
    />
  );
}

CourseContainer.propTypes = {
  courseUsageKey: PropTypes.string.isRequired,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  intl: intlShape.isRequired,
};

export default injectIntl(CourseContainer);
