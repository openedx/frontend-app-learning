import React from 'react';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CoursewareSearch, CoursewareSearchToggle } from '../course-home/courseware-search';
import { useCoursewareSearchState } from '../course-home/courseware-search/hooks';

import Tabs from '../generic/tabs/Tabs';
import messages from './messages';

interface CourseTabsNavigationProps {
  activeTabSlug?: string;
  className?: string | null;
  tabs: Array<{
    title: string;
    slug: string;
    url: string;
  }>;
}

const CourseTabsNavigation = ({
  activeTabSlug = undefined,
  className = null,
  tabs,
}:CourseTabsNavigationProps) => {
  const intl = useIntl();
  const { show } = useCoursewareSearchState();

  return (
    <div id="courseTabsNavigation" className={classNames('course-tabs-navigation', className)}>
      <div className="container-xl">
        <div className="nav-bar">
          <div className="nav-menu">
            <Tabs
              className="nav-underline-tabs"
              aria-label={intl.formatMessage(messages.courseMaterial)}
            >
              <PluginSlot id="course_tab_links_slot">
                {tabs.map(({ url, title, slug }) => (
                  <a
                    key={slug}
                    className={classNames('nav-item flex-shrink-0 nav-link', { active: slug === activeTabSlug })}
                    href={url}
                  >
                    {title}
                  </a>
                ))}
              </PluginSlot>
            </Tabs>
          </div>
          <div className="search-toggle">
            <CoursewareSearchToggle />
          </div>
        </div>
      </div>
      {show && <CoursewareSearch />}
    </div>
  );
};

export default CourseTabsNavigation;
