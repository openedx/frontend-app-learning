import { CourseTabsNavigation, type CourseTabsNavigationProps } from '@src/course-tabs';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CourseTabsNavigationSlot = ({
  tabs,
  activeTabSlug,
  showNavbar = true,
  showSearchButton = true,
}: CourseTabsNavigationProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_tabs_navigation.v1"
    pluginProps={{ showNavbar, showSearchButton }}
    slotOptions={{ mergeProps: true }}
  >
    <CourseTabsNavigation
      tabs={tabs}
      activeTabSlug={activeTabSlug}
      showNavbar={showNavbar}
      showSearchButton={showSearchButton}
    />
  </PluginSlot>
);
