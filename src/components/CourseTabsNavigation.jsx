import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import NavTab from './NavTab';

function CourseTabsNavigation({ activeTabSlug, courseTabs, intl }) {
  const courseNavTabs = courseTabs.map(({ slug, ...courseTab }) => (
    <NavTab
      isActive={slug === activeTabSlug}
      key={slug}
      {...courseTab}
    />
  ));

  return (
    <nav
      aria-label={intl.formatMessage(messages['learn.navigation.course.tabs.label'])}
      className="nav nav-underline-tabs"
    >
      {courseNavTabs}
    </nav>
  );
}

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  courseTabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    priority: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })),
  intl: intlShape.isRequired,
};

CourseTabsNavigation.defaultProps = {
  activeTabSlug: undefined,
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
};

export default injectIntl(CourseTabsNavigation);
