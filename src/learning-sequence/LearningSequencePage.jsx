import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import PageLoading from './PageLoading';
import messages from './messages';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import CourseStructureContext from './CourseStructureContext';
import { useLoadCourseStructure, useMissingSubSectionRedirect } from './data/hooks';
import SubSection from './sub-section/SubSection';
import { history } from '@edx/frontend-platform';

function LearningSequencePage({ match, intl }) {
  const {
    courseId,
    subSectionId,
    unitId,
  } = match.params;

  const { blocks, loaded, courseBlockId } = useLoadCourseStructure(courseId);

  useMissingSubSectionRedirect(loaded, blocks, courseId, courseBlockId, subSectionId);

  return (
    <main className="container-fluid d-flex flex-column flex-grow-1">
      <CourseStructureContext.Provider value={{
          courseId,
          courseBlockId,
          subSectionId,
          unitId,
          blocks,
          loaded,
        }}
      >
        {!loaded && <PageLoading
          srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
        />}

        {loaded && unitId && <CourseBreadcrumbs />}
        {subSectionId && <SubSection />}
      </CourseStructureContext.Provider>

    </main>
  );
}

export default injectIntl(LearningSequencePage);

LearningSequencePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      subSectionId: PropTypes.string,
      unitId: PropTypes.string,
    }).isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};
