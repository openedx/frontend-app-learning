import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import PageLoading from './PageLoading';
import messages from './messages';

import CourseBreadcrumbs from './CourseBreadcrumbs';
import SubSection from './SubSection';

import { useCourseStructure } from './hooks';
import CourseStructureContext from './CourseStructureContext';

function LearningSequencePage({ match, intl }) {
  const {
    courseId,
    subSectionId,
    unitId,
  } = match.params;

  const { blocks, loaded, courseBlockId } = useCourseStructure(courseId);

  return (
    <main>
      <div className="container-fluid">
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

          {loaded && <CourseBreadcrumbs />}
          {/* <SubSection /> */}
        </CourseStructureContext.Provider>
      </div>
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
