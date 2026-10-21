import type { SidebarWidget } from '@src/courseware/course/sidebar/SidebarContext';

export const upgradeIsAvailable: NonNullable<SidebarWidget['isAvailable']> = ({ course }) => !!course?.verifiedMode;
