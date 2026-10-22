import { providesCourseBarMasqueradeRolesId, providesCourseBarRolesId } from '@openedx/frontend-base';

import { learningCourseRole } from './constants';

const provides = {
  [providesCourseBarRolesId]: [learningCourseRole],
  [providesCourseBarMasqueradeRolesId]: [learningCourseRole],
};

export default provides;
