import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import classNames from 'classnames';

import messages from './messages';
import Tabs from '../../tabs/Tabs';

function CourseTabsNavigation({
  activeTabSlug, tabs, intl,
}) {
  return (
    <div className="course-tabs-navigation">
      <div className="container-fluid">
        <Tabs
          className="nav-underline-tabs"
          aria-label={intl.formatMessage(messages['learn.navigation.course.tabs.label'])}
        >
          {tabs.map(({ url, title, slug }) => (
            <a
              key={slug}
              className={classNames('nav-link', { active: slug === activeTabSlug })}
              href={`${getConfig().LMS_BASE_URL}${url}`}
            >
              {title}
            </a>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    priority: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
  intl: intlShape.isRequired,
};

CourseTabsNavigation.defaultProps = {
  activeTabSlug: undefined,
};

export default injectIntl(CourseTabsNavigation);
