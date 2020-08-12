import { getConfig } from '@edx/frontend-platform';
import { useModel } from '../generic/model-store';

export default function CourseRedirect({ match }) {
  const { courseId, unitId } = match.params;
  const unit = useModel('units', unitId);

  const lmsWebUrl = unit !== undefined ? unit.lmsWebUrl : null;
  if (lmsWebUrl) {
    global.location.assign(lmsWebUrl);
  } else {
    global.location.assign(`${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware/`);
  }
  return null;
}
