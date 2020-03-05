import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';

import AlertList from '../user-messages/AlertList';
import CourseHeader from '../courseware/course/CourseHeader';
import CourseTabsNavigation from '../courseware/course/CourseTabsNavigation';
import CourseDates from './CourseDates';
import { useLogistrationAlert, useEnrollmentAlert } from '../hooks';
import Chapter from './Chapter';
import { courseBlocksShape } from '../data/course-blocks';

const EnrollmentAlert = React.lazy(() => import('../enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../logistration-alert'));

export default function Outline({
  courseOrg,
  courseNumber,
  courseName,
  courseUsageKey,
  courseId,
  models,
  tabs,
  start,
  end,
  enrollmentStart,
  enrollmentEnd,
  enrollmentMode,
  isEnrolled,
}) {
  const course = models[courseId];

  useLogistrationAlert();
  useEnrollmentAlert(isEnrolled);

  return (
    <>
      <CourseHeader
        courseOrg={courseOrg}
        courseNumber={courseNumber}
        courseName={courseName}
      />
      <main className="d-flex flex-column flex-grow-1">
        <div className="container-fluid">
          <CourseTabsNavigation tabs={tabs} className="mb-3" activeTabSlug="courseware" />
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
              <h2>{courseName}</h2>
              <Button className="btn-primary" type="button">Resume Course</Button>
            </div>
            <div className="row">
              <div className="col col-8">
                {course.children.map((chapterId) => (
                  <Chapter
                    key={chapterId}
                    id={chapterId}
                    courseUsageKey={courseUsageKey}
                    models={models}
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
          </div>
        </div>
      </main>
    </>
  );
}

Outline.propTypes = {
  courseOrg: PropTypes.string.isRequired,
  courseNumber: PropTypes.string.isRequired,
  courseName: PropTypes.string.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  enrollmentStart: PropTypes.string.isRequired,
  enrollmentEnd: PropTypes.string.isRequired,
  enrollmentMode: PropTypes.string.isRequired,
  isEnrolled: PropTypes.bool,
  models: courseBlocksShape.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    slug: PropTypes.string.isRequired,
    priority: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
};

Outline.defaultProps = {
  isEnrolled: false,
};
