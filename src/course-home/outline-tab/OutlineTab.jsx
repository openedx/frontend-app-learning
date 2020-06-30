import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@edx/paragon';

import { AlertList } from '../../user-messages';

import CourseDates from './widgets/CourseDates';
import CourseTools from './widgets/CourseTools';
import Section from './Section';
import { useModel } from '../../generic/model-store';

// Note that we import from the component files themselves in the enrollment-alert package.
// This is because React.lazy() requires that we import() from a file with a Component as its
// default export.
// See React.lazy docs here: https://reactjs.org/docs/code-splitting.html#reactlazy
const { EnrollmentAlert, StaffEnrollmentAlert } = React.lazy(() => import('../../alerts/enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../../alerts/logistration-alert'));

export default function OutlineTab() {
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
        <Button className="btn-primary" type="button">Resume Course</Button>
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
        </div>
      </div>
    </>
  );
}
