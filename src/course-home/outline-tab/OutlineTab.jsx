import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { AlertList } from '../../generic/user-messages';

import CourseDates from './widgets/CourseDates';
// import CourseHandouts from './widgets/CourseHandouts';
import CourseTools from './widgets/CourseTools';
import messages from './messages';
import Section from './Section';
import { useModel } from '../../generic/model-store';

// Note that we import from the component files themselves in the enrollment-alert package.
// This is because React.lazy() requires that we import() from a file with a Component as its
// default export.
// See React.lazy docs here: https://reactjs.org/docs/code-splitting.html#reactlazy
const { EnrollmentAlert, StaffEnrollmentAlert } = React.lazy(() => import('../../alerts/enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../../alerts/logistration-alert'));

function OutlineTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    title,
    start,
    end,
    enrollmentStart,
    enrollmentEnd,
    enrollmentMode,
    isEnrolled,
  } = useModel('courses', courseId);

  const {
    courseBlocks: {
      courses,
      sections,
    },
  } = useModel('outline', courseId);

  const rootCourseId = Object.keys(courses)[0];
  const { sectionIds } = courses[rootCourseId];

  return (
    <>
      <AlertList
        topic="outline"
        className="mb-3"
        customAlerts={{
          clientEnrollmentAlert: EnrollmentAlert,
          clientStaffEnrollmentAlert: StaffEnrollmentAlert,
          clientLogistrationAlert: LogistrationAlert,
        }}
      />
      <div className="d-flex justify-content-between mb-3">
        <h2>{title}</h2>
        <Button className="btn-primary" type="button">{intl.formatMessage(messages.resume)}</Button>
      </div>
      <div className="row">
        <div className="col col-8">
          {sectionIds.map((sectionId) => (
            <Section
              key={sectionId}
              courseId={courseId}
              title={sections[sectionId].title}
              sequenceIds={sections[sectionId].sequenceIds}
            />
          ))}
        </div>
        <div className="col col-4">
          <CourseTools
            courseId={courseId}
          />
          <CourseDates
            start={start}
            end={end}
            enrollmentStart={enrollmentStart}
            enrollmentEnd={enrollmentEnd}
            enrollmentMode={enrollmentMode}
            isEnrolled={isEnrolled}
            courseId={courseId}
          />
          {/* Disabled until we decide whether iframes are the best solution for handouts
          <CourseHandouts
            courseId={courseId}
          />
          */}
        </div>
      </div>
    </>
  );
}

OutlineTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OutlineTab);
