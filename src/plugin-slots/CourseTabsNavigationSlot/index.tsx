import { CourseTabsNavigation, type CourseTabsNavigationProps } from '@src/course-tabs';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CourseTabsNavigationSlot = ({ tabs, activeTabSlug }: CourseTabsNavigationProps) => (
  <PluginSlot id="org.openedx.frontend.learning.course_tabs_navigation.v1">
    <CourseTabsNavigation tabs={tabs} activeTabSlug={activeTabSlug} />
  </PluginSlot>
);
