import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import NavTab from './NavTab';

function CourseTabsNavigation({ courseTabs, activeTabSlug, intl }) {
  const courseNavTabs = courseTabs.map(({ slug, ...courseTab }) => (
    <NavTab
      key={slug}
      isActive={slug === activeTabSlug}
      {...courseTab}
    />
  ));

  return (
    <nav
      className="nav nav-underline-tabs"
      aria-label={intl.formatMessage(messages['learn.navigation.course.tabs.label'])}
    >
      {courseNavTabs}
    </nav>
  );
}

CourseTabsNavigation.propTypes = {
  courseTabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    priority: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired,
  })),
  activeTabSlug: PropTypes.string,
  intl: intlShape.isRequired,
};

CourseTabsNavigation.defaultProps = {
  courseTabs: [
    {
      title: 'Course',
      slug: 'course',
      priority: 1,
      url: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/course/',
    },

    {
      title: 'Discussion',
      slug: 'discussion',
      priority: 2,
      url: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/discussion/forum/',
    },
    {
      title: 'Wiki',
      slug: 'wiki',
      priority: 3,
      url: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/course_wiki',
    },
    {
      title: 'Progress',
      slug: 'progress',
      priority: 4,
      url: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/progress',
    },
    {
      title: 'Instructor',
      slug: 'instructor',
      priority: 5,
      url: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/instructor',
    },
  ],
  activeTabSlug: undefined,
};

export default injectIntl(CourseTabsNavigation);
