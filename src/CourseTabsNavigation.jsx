import React from 'react';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import PropTypes from 'prop-types';


function NavTab({ url, title, isActive }) {
  const className = classNames('nav-item nav-link', {
    active: isActive,
  });

  return <a className={className} href={url}>{title}</a>;
}

NavTab.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

NavTab.defaultProps = {
  isActive: false,
};


function CourseTabsNavigation({ courseTabs, activeTabSlug, intl }) {
  return (
    <nav
      className="nav nav-underline-tabs"
      aria-label={intl.formatMessage(messages['learn.navigation.course.tabs.label'])}
    >
      {courseTabs.map(({ slug, ...courseTab }) => (
        <NavTab
          {...courseTab}
          isActive={slug === activeTabSlug}
        />
      ))}
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
