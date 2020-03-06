import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { fetchCourseMetadata, courseMetadataShape } from '../data/course-meta';
import { fetchCourseBlocks, courseBlocksShape } from '../data/course-blocks';

import messages from '../courseware/messages';
import PageLoading from '../PageLoading';
import Outline from './Outline';

function OutlineContainer(props) {
  const {
    intl,
    match,
    courseId,
    blocks: models,
    metadata,
  } = props;
  const { courseUsageKey } = match.params;

  useEffect(() => {
    props.fetchCourseMetadata(courseUsageKey);
    props.fetchCourseBlocks(courseUsageKey);
  }, [courseUsageKey]);

  const ready = metadata.fetchState === 'loaded' && courseId;

  return (
    <>
      {ready ? (
        <Outline
          courseOrg={metadata.org}
          courseNumber={metadata.number}
          courseName={metadata.name}
          courseUsageKey={courseUsageKey}
          courseId={courseId}
          start={metadata.start}
          end={metadata.end}
          enrollmentStart={metadata.enrollmentStart}
          enrollmentEnd={metadata.enrollmentEnd}
          enrollmentMode={metadata.enrollmentMode}
          isEnrolled={metadata.isEnrolled}
          models={models}
          tabs={metadata.tabs}
        />
      ) : (
        <PageLoading
          srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
        />
      )}
    </>
  );
}

OutlineContainer.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string,
  blocks: courseBlocksShape,
  metadata: courseMetadataShape,
  fetchCourseMetadata: PropTypes.func.isRequired,
  fetchCourseBlocks: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseUsageKey: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

OutlineContainer.defaultProps = {
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
})(injectIntl(OutlineContainer));
