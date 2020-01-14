import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import CourseContainer from './CourseContainer';

function LearningSequencePage({ match, intl }) {
  const {
    courseUsageKey,
    sequenceId,
    unitId,
  } = match.params;

  // const { blocks, loaded, courseId } = useLoadCourseStructure(courseId);

  // useMissingSequenceRedirect(loaded, blocks, courseId, courseId, sequenceId);

  return (
    <CourseContainer courseUsageKey={courseUsageKey} sequenceId={sequenceId} unitId={unitId} />
    // <main className="container-fluid d-flex flex-column flex-grow-1">
    //   <CourseStructureContext.Provider value={{
    //       courseId,
    //       courseId,
    //       sequenceId,
    //       unitId,
    //       blocks,
    //       loaded,
    //     }}
    //   >
    //     {!loaded && <PageLoading
    //       srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
    //     />}

  //     {loaded && unitId && <CourseBreadcrumbs />}
  //     {sequenceId && <Sequence />}
  //   </CourseStructureContext.Provider>

  // </main>
  );
}

export default injectIntl(LearningSequencePage);

LearningSequencePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseUsageKey: PropTypes.string.isRequired,
      sequenceId: PropTypes.string,
      unitId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};
