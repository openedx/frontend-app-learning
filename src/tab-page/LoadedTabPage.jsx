import React from 'react';
import PropTypes from 'prop-types';

import { Header, CourseTabsNavigation } from '../course-header';
import { useModel } from '../generic/model-store';
import { AlertList } from '../generic/user-messages';
import InstructorToolbar from '../instructor-toolbar';
import useEnrollmentAlert from '../alerts/enrollment-alert';
import useLogistrationAlert from '../alerts/logistration-alert';

function LoadedTabPage({
  activeTabSlug,
  children,
  courseId,
  unitId,
}) {
  const {
    originalUserIsStaff,
    number,
    org,
    tabs,
    title,
  } = useModel('courses', courseId);

  const logistrationAlert = useLogistrationAlert(courseId);
  const enrollmentAlert = useEnrollmentAlert(courseId);

  return (
    <>
      <Header
        courseOrg={org}
        courseNumber={number}
        courseTitle={title}
      />
      {originalUserIsStaff && (
        <InstructorToolbar
          courseId={courseId}
          unitId={unitId}
        />
      )}
      <main className="d-flex flex-column flex-grow-1">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...enrollmentAlert,
            ...logistrationAlert,
          }}
        />
        <CourseTabsNavigation tabs={tabs} className="mb-3" activeTabSlug={activeTabSlug} />
        <div className="container-fluid">
          {children}
        </div>
      </main>
    </>
  );
}

LoadedTabPage.propTypes = {
  activeTabSlug: PropTypes.string.isRequired,
  children: PropTypes.node,
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
};

LoadedTabPage.defaultProps = {
  children: null,
  unitId: null,
};

export default LoadedTabPage;
