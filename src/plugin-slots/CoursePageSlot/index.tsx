import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const CoursePageSlot = ({ pageId } : { pageId: string }) => (
    <PluginSlot id={`org.openedx.frontend.learning.course_page.${pageId}.v1`} />
);
