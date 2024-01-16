import PropTypes from 'prop-types';
import {
  generatePath, useParams, useLocation,
} from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';

import queryString from 'query-string';
import { REDIRECT_MODES } from '../constants';

const RedirectPage = ({
  pattern, mode,
}) => {
  const { courseId } = useParams();
  const location = useLocation();
  const { consentPath } = queryString.parse(location?.search);

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

RedirectPage.propTypes = {
  pattern: PropTypes.string,
  mode: PropTypes.string.isRequired,
};

RedirectPage.defaultProps = {
  pattern: null,
};

export default RedirectPage;
