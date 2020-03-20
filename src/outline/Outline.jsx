import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import AlertList from '../user-messages/AlertList';
import CourseHeader from '../courseware/course/CourseHeader';
import { courseShape } from '../courseware/course/shapes';
import CourseTabsNavigation from '../courseware/course/CourseTabsNavigation';
import { useLogistrationAlert, useEnrollmentAlert } from '../hooks';

import CourseDates from './CourseDates';
import Section from './Section';

const EnrollmentAlert = React.lazy(() => import('../enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../logistration-alert'));

export default function Outline({
  course,
  courseUsageKey,
}) {
  useLogistrationAlert();
  useEnrollmentAlert(course.isEnrolled);

  return (
    <>
      <CourseHeader
        courseOrg={course.org}
        courseNumber={course.number}
        courseTitle={course.title}
      />
      <main className="d-flex flex-column flex-grow-1">
        <div className="container-fluid">
          <CourseTabsNavigation tabs={course.tabs} className="mb-3" activeTabSlug="courseware" />
          <AlertList
            topic="outline"
            className="mb-3"
            customAlerts={{
              clientEnrollmentAlert: EnrollmentAlert,
              clientLogistrationAlert: LogistrationAlert,
            }}
          />
        </div>
        <div className="flex-grow-1">
          <div className="container-fluid">
            <div className="d-flex justify-content-between mb-3">
              <h2>{course.title}</h2>
              <Button className="btn-primary" type="button">Resume Course</Button>
            </div>
            <div className="row">
              <div className="col col-8">
                {course.sectionIds.map((sectionId) => (
                  <Section
                    key={sectionId}
                    id={sectionId}
                    courseUsageKey={courseUsageKey}
                  />
                ))}
              </div>
              <div className="col col-4">
                <CourseDates
                  start={course.start}
                  end={course.end}
                  enrollmentStart={course.enrollmentStart}
                  enrollmentEnd={course.enrollmentEnd}
                  enrollmentMode={course.enrollmentMode}
                  isEnrolled={course.isEnrolled}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

Outline.propTypes = {
  course: courseShape.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
};
