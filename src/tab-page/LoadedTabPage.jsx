import React from 'react';
import PropTypes from 'prop-types';

import { Header, CourseTabsNavigation } from '../course-header';
import { useModel } from '../generic/model-store';
import InstructorToolbar from '../instructor-toolbar';

function LoadedTabPage({
  activeTabSlug,
  children,
  courseId,
  unitId,
}) {
  const {
    isStaff,
    number,
    org,
    tabs,
    title,
  } = useModel('courses', courseId);

  return (
    <>
      <Header
        courseOrg={org}
        courseNumber={number}
        courseTitle={title}
      />
      {isStaff && (
        <InstructorToolbar
          courseId={courseId}
          unitId={unitId}
        />
      )}
      <main className="d-flex flex-column flex-grow-1">
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
