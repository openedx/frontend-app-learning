import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history, getConfig, camelCaseObject } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import messages from './messages';
import PageLoading from './PageLoading';
import Course from './course/Course';
import { createBlocksMap } from './utils';

export async function getCourseBlocks(courseUsageKey, username) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseUsageKey);
  url.searchParams.append('username', username);
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,show_gated_sections');

  const { data } = await getAuthenticatedHttpClient().get(url.href, {});

  return data;
}

export async function getCourse(courseUsageKey) {
  const url = `${getConfig().LMS_BASE_URL}/api/courses/v2/courses/${courseUsageKey}`;
  const { data } = await getAuthenticatedHttpClient().get(url);

  return data;
}

function useLoadCourse(courseUsageKey) {
  const { authenticatedUser } = useContext(AppContext);

  const [models, setModels] = useState(null);
  const [courseId, setCourseId] = useState();
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    getCourseBlocks(courseUsageKey, authenticatedUser.username).then((blocksData) => {
      setModels(createBlocksMap(blocksData.blocks));
      setCourseId(blocksData.root);
    });
    getCourse(courseUsageKey).then((data) => {
      console.log(data);
      setMetadata(camelCaseObject(data));
    });
  }, [courseUsageKey]);

  return {
    models, courseId, metadata,
  };
}

function CourseContainer(props) {
  const { intl, match } = props;
  const {
    courseUsageKey,
    sequenceId,
    unitId,
  } = match.params;
  const { models, courseId, metadata } = useLoadCourse(courseUsageKey);

  useEffect(() => {
    if (courseId && !sequenceId) {
      // TODO: This is temporary until we get an actual activeSequenceId into the course model data.
      const course = models[courseId];
      const chapter = models[course.children[0]];
      const activeSequenceId = chapter.children[0];
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

  return metadata && (
    <Course
      courseUsageKey={courseUsageKey}
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      models={models}
      tabs={metadata.tabs}
    />
  );
}

CourseContainer.propTypes = {
  intl: intlShape.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseUsageKey: PropTypes.string.isRequired,
      sequenceId: PropTypes.string,
      unitId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default injectIntl(CourseContainer);
