import type { SidebarWidgetContext } from '@src/courseware/course/sidebar/SidebarContext';

export const upgradeIsAvailable = ({ course }: SidebarWidgetContext) => !!course?.verifiedMode;
