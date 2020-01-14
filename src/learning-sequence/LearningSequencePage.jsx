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
import Sequence from './sequence/Sequence';

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
        {subSectionId && (
          <Sequence
            courseId={courseId}
            id={subSectionId}
            unitIds={[
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@867dddb6f55d410caaa9c1eb9c6743ec",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@3e3f9b5199ba4e96b2fc6539087cfe2c",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@4f6c1b4e316a419ab5b6bf30e6c708e9",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@3dc16db8d14842e38324e95d4030b8a0",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@4a1bba2a403f40bca5ec245e945b0d76",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@f0e6d90842c44cc7a50fd1a18a7dd982",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@256f17a44983429fb1a60802203ee4e0",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@e3601c0abee6427d8c17e6d6f8fdddd1",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@a79d59cd72034188a71d388f4954a606",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@134df56c516a4a0dbb24dd5facef746e",
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@d91b9e5d8bc64d57a1332d06bf2f2193",
            ]}
            units={{
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@867dddb6f55d410caaa9c1eb9c6743ec": {
                "type": "other",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Getting Started",
                "bookmarked": false,
                "graded": false,
                "page_title": "Getting Started",
                "href": "",
                "complete": true,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@867dddb6f55d410caaa9c1eb9c6743ec"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@3e3f9b5199ba4e96b2fc6539087cfe2c": {
                "type": "other",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > MY unit",
                "bookmarked": false,
                "graded": false,
                "page_title": "MY unit",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@3e3f9b5199ba4e96b2fc6539087cfe2c"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@4f6c1b4e316a419ab5b6bf30e6c708e9": {
                "type": "video",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Working with Videos",
                "bookmarked": false,
                "graded": false,
                "page_title": "Working with Videos",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@4f6c1b4e316a419ab5b6bf30e6c708e9"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@3dc16db8d14842e38324e95d4030b8a0": {
                "type": "video",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Videos on edX",
                "bookmarked": false,
                "graded": false,
                "page_title": "Videos on edX",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@3dc16db8d14842e38324e95d4030b8a0"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@4a1bba2a403f40bca5ec245e945b0d76": {
                "type": "other",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Video Demonstrations",
                "bookmarked": false,
                "graded": false,
                "page_title": "Video Demonstrations",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@4a1bba2a403f40bca5ec245e945b0d76"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@f0e6d90842c44cc7a50fd1a18a7dd982": {
                "type": "video",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Video Demonstrations",
                "bookmarked": false,
                "graded": false,
                "page_title": "Video Demonstrations",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@f0e6d90842c44cc7a50fd1a18a7dd982"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@256f17a44983429fb1a60802203ee4e0": {
                "type": "video",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Video Presentation Styles",
                "bookmarked": false,
                "graded": false,
                "page_title": "Video Presentation Styles",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@256f17a44983429fb1a60802203ee4e0"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@e3601c0abee6427d8c17e6d6f8fdddd1": {
                "type": "problem",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Interactive Questions",
                "bookmarked": false,
                "graded": false,
                "page_title": "Interactive Questions",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@e3601c0abee6427d8c17e6d6f8fdddd1"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@a79d59cd72034188a71d388f4954a606": {
                "type": "other",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Exciting Labs and Tools",
                "bookmarked": false,
                "graded": false,
                "page_title": "Exciting Labs and Tools",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@a79d59cd72034188a71d388f4954a606"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@134df56c516a4a0dbb24dd5facef746e": {
                "type": "problem",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > Reading Assignments",
                "bookmarked": false,
                "graded": false,
                "page_title": "Reading Assignments",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@134df56c516a4a0dbb24dd5facef746e"
              },
              "block-v1:edX+DemoX+Demo_Course+type@vertical+block@d91b9e5d8bc64d57a1332d06bf2f2193": {
                "type": "other",
                "path": "Example Week 1: Getting Started > Lesson 1 - Getting Started > When Are Your Exams? ",
                "bookmarked": false,
                "graded": false,
                "page_title": "When Are Your Exams? ",
                "href": "",
                "complete": false,
                "content": "",
                "id": "block-v1:edX+DemoX+Demo_Course+type@vertical+block@d91b9e5d8bc64d57a1332d06bf2f2193"
              },
            }}
            displayName="Sequence Name"
            activeUnitId="block-v1:edX+DemoX+Demo_Course+type@vertical+block@867dddb6f55d410caaa9c1eb9c6743ec"
            showCompletion={true}
            isTimeLimited={false}
            bannerText={null}
            onNext={() => {}}
            onPrevious={() => {}}
            onNavigateUnit={() => {}}
            isGated={false}
            prerequisite={{
              name: 'Prerequisite name',
              url: 'url? or id',
              id: 'asdasd',
            }}
            savePosition={true}
          />
        )}
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
