import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history, getConfig } from '@edx/frontend-platform';
import { fetchCourseMetadata } from '../data/course-meta/thunks';
import { fetchCourseBlocks } from '../data/course-blocks/thunks';

import messages from './messages';
import PageLoading from './PageLoading';
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

  if (!courseId || !sequenceId) {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  return metadataLoaded && (
    <Course
      courseOrg={props.metadata.org}
      courseNumber={props.metadata.number}
      courseName={props.metadata.name}
      courseUsageKey={courseUsageKey}
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      models={models}
      tabs={props.metadata.tabs}
      enrollmentIsActive={props.metadata.enrollmentIsActive}
      verifiedMode={props.metadata.verifiedMode}
    />
  );
}

CourseContainer.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string,
  blocks: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string,
  })),
  metadata: PropTypes.shape({
    fetchState: PropTypes.string,
    org: PropTypes.string,
    number: PropTypes.string,
    name: PropTypes.string,
    userHasAccess: PropTypes.bool,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      priority: PropTypes.number,
      slug: PropTypes.string,
      title: PropTypes.string,
      type: PropTypes.string,
      url: PropTypes.string,
    })),
    enrollmentIsActive: PropTypes.bool,
    verifiedMode: PropTypes.shape({
      price: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
      currencySymbol: PropTypes.string.isRequired,
      sku: PropTypes.string.isRequired,
      upgradeUrl: PropTypes.string.isRequired,
    }),
  }),
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
