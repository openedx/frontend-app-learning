import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import messages from './messages';
import NavTab from './NavTab';

function CourseTabsNavigation({
  activeTabSlug, tabs, intl, className,
}) {
  const courseNavTabs = tabs.map(({ slug, ...courseTab }) => (
    <NavTab
      isActive={slug === activeTabSlug}
      key={slug}
      {...courseTab}
    />
  ));

  return (
    <nav
      aria-label={intl.formatMessage(messages['learn.navigation.course.tabs.label'])}
      className={classNames('nav nav-underline-tabs', className)}
    >
      {courseNavTabs}
    </nav>
  );
}

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  className: PropTypes.string,
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
  className: null,
};

export default injectIntl(CourseTabsNavigation);
