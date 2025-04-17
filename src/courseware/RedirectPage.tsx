import {
  generatePath, useParams, useLocation, useSearchParams,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';

import { REDIRECT_MODES } from '../constants';

interface Props {
  pattern: string;
  mode: string;
}

const RedirectPage = ({ pattern = '', mode }: Props) => {
  const { courseId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const consentPath = searchParams.get('consentPath') ?? '';

  const {
    LMS_BASE_URL,
    ENTERPRISE_LEARNER_PORTAL_URL,
  } = getConfig();

  switch (mode) {
    case REDIRECT_MODES.DASHBOARD_REDIRECT:
      global.location.assign(`${LMS_BASE_URL}${pattern}${location?.search}`);
      break;
    case REDIRECT_MODES.ENTERPRISE_LEARNER_DASHBOARD_REDIRECT:
      global.location.assign(ENTERPRISE_LEARNER_PORTAL_URL);
      break;
    case REDIRECT_MODES.CONSENT_REDIRECT:
      global.location.assign(`${LMS_BASE_URL}${consentPath}`);
      break;
    case REDIRECT_MODES.HOME_REDIRECT:
      global.location.assign(generatePath(pattern, { courseId }));
      break;
    default:
      global.location.assign(`${LMS_BASE_URL}${generatePath(pattern, { courseId })}`);
  }

  return null;
};

export default RedirectPage;
