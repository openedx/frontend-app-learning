import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CoursePageSlot = ({ route } : { route: string }) => <PluginSlot id="org.openedx.frontend.learning.course_page.v1" pluginProps={{ route }} />;
