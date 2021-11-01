import { Redirect, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';

/**
 * We have seen evidence of learners hitting MFE pages with spaces instead of plus signs (which are used commonly
 * in our course keys). It's possible something out there is un-escaping our paths before sending learners to them.
 *
 * So this provider fixes those paths up and logs it so that we can try to fix the source.
 *
 * This might be temporary, based on how much we can fix the sources of these urls-with-spaces.
 */
const PathFixesProvider = ({ children }) => {
  const location = useLocation();

  // We only check for spaces. That's not the only kind of character that is escaped in URLs, but it would always be
  // present for our cases, and I believe it's the only one we use normally.
  if (location.pathname.includes(' ')) {
    const newLocation = {
      ...location,
      pathname: location.pathname.replaceAll(' ', '+'),
    };

    sendTrackEvent('edx.ui.lms.path_fixed', {
      new_path: newLocation.pathname,
      old_path: location.pathname,
      referrer: document.referrer,
      search: location.search,
    });

    return (<Redirect to={newLocation} />);
  }

  return children; // pass through
};

PathFixesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PathFixesProvider;
