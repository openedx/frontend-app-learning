import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history, getConfig } from '@edx/frontend-platform';
import { fetchCourseMetadata, courseMetadataShape } from '../data/course-meta';
import { fetchCourseBlocks } from '../data/course-blocks';

import messages from './messages';
import PageLoading from '../PageLoading';
import Course from './course/Course';

function CourseContainer(props) {
  const {
    intl,
    match,
    courseId,
    blocks: models,
    metadata,
  } = props;
  const {
    courseUsageKey,
    sequenceId,
    unitId,
  } = match.params;

  const metadataLoaded = metadata.fetchState === 'loaded';

  useEffect(() => {
    props.fetchCourseMetadata(courseUsageKey);
    props.fetchCourseBlocks(courseUsageKey);
  }, [courseUsageKey]);

  useEffect(() => {
    if (courseId && !sequenceId) {
      // TODO: This is temporary until we get an actual activeSequenceId into the course model data.
      const course = models[courseId];
      const chapter = models[course.children[0]];
      const activeSequenceId = chapter.children[0];
      history.push(`/course/${courseUsageKey}/${activeSequenceId}`);
    }
  }, [courseUsageKey, courseId, sequenceId]);

  useEffect(() => {
    if (metadataLoaded && !metadata.userHasAccess) {
      global.location.assign(`${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/course/`);
    }
  }, [metadataLoaded]);

  const isLoaded = courseId && sequenceId && metadataLoaded;

  return (
    <main className="flex-grow-1 d-flex flex-column">
      { isLoaded ? (
        <Course
          courseOrg={props.metadata.org}
          courseNumber={props.metadata.number}
          courseName={props.metadata.name}
          courseUsageKey={courseUsageKey}
          courseId={courseId}
          isEnrolled={props.metadata.isEnrolled}
          sequenceId={sequenceId}
          unitId={unitId}
          models={models}
          tabs={props.metadata.tabs}
          verifiedMode={props.metadata.verifiedMode}
        />
      ) : (
        <PageLoading
          srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
        />
      )}
    </main>
  );
}

CourseContainer.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string,
  blocks: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string,
  })),
  metadata: courseMetadataShape,
  fetchCourseMetadata: PropTypes.func.isRequired,
  fetchCourseBlocks: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseUsageKey: PropTypes.string.isRequired,
      sequenceId: PropTypes.string,
      unitId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

CourseContainer.defaultProps = {
  blocks: {},
  metadata: undefined,
  courseId: undefined,
};

const mapStateToProps = state => ({
  courseId: state.courseBlocks.root,
  metadata: state.courseMeta,
  blocks: state.courseBlocks.blocks,
});

export default connect(mapStateToProps, {
  fetchCourseMetadata,
  fetchCourseBlocks,
})(injectIntl(CourseContainer));
