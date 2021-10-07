import { getConfig } from '@edx/frontend-platform';

import { useModel } from '../generic/model-store';

export default function CourseRedirect({ match }) {
  const {
    courseId,
    unitId,
  } = match.params;
  const unit = useModel('units', unitId) || {};
  const coursewareUrl = unit.legacyWebUrl || `${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware/`;
  global.location.assign(coursewareUrl);
  return null;
}
