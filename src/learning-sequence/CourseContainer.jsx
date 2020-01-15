import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history, getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import messages from './messages';
import PageLoading from './PageLoading';
import Course from './course/Course';
import { createBlocksMap } from './utils';

export async function getCourseBlocks(courseId, username) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', decodeURIComponent(courseId));
  url.searchParams.append('username', username);
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,show_gated_sections');

  const { data } = await getAuthenticatedHttpClient().get(url.href, {});

  return data;
}

export async function getCourse(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/courses/v2/courses/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);

  return data;
}

function useLoadCourse(courseUsageKey) {
  const { authenticatedUser } = useContext(AppContext);

  const [models, setModels] = useState(null);
  const [courseId, setCourseId] = useState();

  useEffect(() => {
    getCourseBlocks(courseUsageKey, authenticatedUser.username).then((blocksData) => {
      setModels(createBlocksMap(blocksData.blocks));
      setCourseId(blocksData.root);
    });
  }, [courseUsageKey]);

  return {
    models, courseId,
  };
}


function CourseContainer({
  courseUsageKey, sequenceId, unitId, intl,
}) {
  const { models, courseId } = useLoadCourse(courseUsageKey);

  useEffect(() => {
    if (!sequenceId) {
      // TODO: This will not work right now.
      const { activeSequenceId } = models[courseId];
      history.push(`/course/${courseUsageKey}/${activeSequenceId}`);
    }
  }, [courseUsageKey, courseId, sequenceId]);

  if (!courseId || !sequenceId) {
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
      models={models}
    />
  );
}

CourseContainer.propTypes = {
  courseUsageKey: PropTypes.string.isRequired,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  intl: intlShape.isRequired,
};

CourseContainer.defaultProps = {
  sequenceId: null,
  unitId: null,
};

export default injectIntl(CourseContainer);
