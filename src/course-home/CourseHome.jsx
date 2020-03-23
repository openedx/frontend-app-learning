import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import AlertList from '../user-messages/AlertList';
import { Header, CourseTabsNavigation } from '../course-header';
import { useLogistrationAlert } from '../logistration-alert';
import { useEnrollmentAlert } from '../enrollment-alert';

import CourseDates from './CourseDates';
import Section from './Section';
import { useModel } from '../model-store';

const EnrollmentAlert = React.lazy(() => import('../enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../logistration-alert'));

export default function CourseHome({
  courseUsageKey,
}) {
  useLogistrationAlert();
  useEnrollmentAlert(courseUsageKey);

  const {
    org,
    number,
    title,
    start,
    end,
    enrollmentStart,
    enrollmentEnd,
    enrollmentMode,
    isEnrolled,
    tabs,
    sectionIds,
  } = useModel('courses', courseUsageKey);

  return (
    <>
      <Header
        courseOrg={org}
        courseNumber={number}
        courseTitle={title}
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
              <h2>{title}</h2>
              <Button className="btn-primary" type="button">Resume Course</Button>
            </div>
            <div className="row">
              <div className="col col-8">
                {sectionIds.map((sectionId) => (
                  <Section
                    key={sectionId}
                    id={sectionId}
                    courseUsageKey={courseUsageKey}
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

CourseHome.propTypes = {
  courseUsageKey: PropTypes.string.isRequired,
};
