import { SlotOperation } from '@openedx/frontend-base';

import { coursewareSearchApp } from './widgets/CoursewareSearch';
import { coursewareTabApp } from './widgets/CoursewareTab';
import { datesTabApp } from './widgets/DatesTab';
import { discussionsSidebarApp } from './widgets/DiscussionsSidebar';
import { learningHeaderApp } from './widgets/LearningHeader';
import { liveTabApp } from './widgets/LiveTab';
import { outlineTabApp } from './widgets/OutlineTab';
import { progressTabApp } from './widgets/ProgressTab';

const slots: SlotOperation[] = [
  ...(learningHeaderApp.slots ?? []),
  ...(coursewareSearchApp.slots ?? []),
  ...(discussionsSidebarApp.slots ?? []),
  ...(outlineTabApp.slots ?? []),
  ...(datesTabApp.slots ?? []),
  ...(progressTabApp.slots ?? []),
  ...(liveTabApp.slots ?? []),
  ...(coursewareTabApp.slots ?? []),
];

export default slots;
