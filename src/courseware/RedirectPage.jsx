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

  const BASE_URL = getConfig().LMS_BASE_URL;

  switch (mode) {
    case REDIRECT_MODES.DASHBOARD_REDIRECT:
      global.location.assign(`${BASE_URL}${pattern}${location?.search}`);
      break;
    case REDIRECT_MODES.CONSENT_REDIRECT:
      global.location.assign(`${BASE_URL}${consentPath}`);
      break;
    case REDIRECT_MODES.HOME_REDIRECT:
      global.location.assign(generatePath(pattern, { courseId }));
      break;
    default:
      global.location.assign(`${BASE_URL}${generatePath(pattern, { courseId })}`);
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
