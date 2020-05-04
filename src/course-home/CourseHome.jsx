import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@edx/paragon';

import { AlertList } from '../user-messages';

import CourseDates from './CourseDates';
import Section from './Section';
import { useModel } from '../model-store';

// Note that we import from the component files themselves in the enrollment-alert package.
// This is because Reacy.lazy() requires that we import() from a file with a Component as it's
// default export.
// See React.lazy docs here: https://reactjs.org/docs/code-splitting.html#reactlazy
const { EnrollmentAlert, StaffEnrollmentAlert } = React.lazy(() => import('../enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../logistration-alert'));

export default function CourseHome() {
  const {
    courseId,
  } = useSelector(state => state.courseware);

  const {
    title,
    start,
    end,
    enrollmentStart,
    enrollmentEnd,
    enrollmentMode,
    isEnrolled,
    sectionIds,
  } = useModel('courses', courseId);

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
              id={sectionId}
              courseId={courseId}
            />
          ))}
        </div>
        <div className="col col-4">
          <CourseDates
            start={start}
            end={end}
            enrollmentStart={enrollmentStart}
            enrollmentEnd={enrollmentEnd}
            enrollmentMode={enrollmentMode}
            isEnrolled={isEnrolled}
          />
        </div>
      </div>
    </>
  );
}
