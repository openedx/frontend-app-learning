import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import messages from './messages';
import Tabs from '../generic/tabs/Tabs';

const CourseTabsNavigation = ({
  activeTabSlug, className, tabs, intl,
}) => (
  <div id="courseTabsNavigation" className={classNames('course-tabs-navigation', className)}>
    <div className="container-xl">
      <nav className="nav flex-column nav-pills">
        <div aria-label={intl.formatMessage(messages.courseMaterial)}>
        <div className="nav-items-container">
            {tabs.map(({ url, title, slug }) => (
              <a
                key={slug}
                className={classNames('nav-link', { active: slug === activeTabSlug })}
                href={url}
              >
                {title}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  </div>
);

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  className: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
  intl: intlShape.isRequired,
};

CourseTabsNavigation.defaultProps = {
  activeTabSlug: undefined,
  className: null,
};

export default injectIntl(CourseTabsNavigation);
