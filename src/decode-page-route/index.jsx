import PropTypes from 'prop-types';
import { PageRoute } from '@edx/frontend-platform/react';
import React from 'react';
import { useHistory, generatePath } from 'react-router';

export const decodeUrl = (encodedUrl) => {
  const decodedUrl = decodeURIComponent(encodedUrl);
  if (encodedUrl === decodedUrl) {
    return encodedUrl;
  }
  return decodeUrl(decodedUrl);
};

const DecodePageRoute = (props) => {
  const history = useHistory();
  if (props.computedMatch) {
    const { url, path, params } = props.computedMatch;

    Object.keys(params).forEach((param) => {
      // only decode params not the entire url.
      // it is just to be safe and less prone to errors
      params[param] = decodeUrl(params[param]);
    });

    const newUrl = generatePath(path, params);

    // if the url get decoded, reroute to the decoded url
    if (newUrl !== url) {
      history.replace(newUrl);
    }
  }

  return <PageRoute {...props} />;
};

DecodePageRoute.propTypes = {
  computedMatch: PropTypes.shape({
    url: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    params: PropTypes.any,
  }),
};

DecodePageRoute.defaultProps = {
  computedMatch: null,
};

export default DecodePageRoute;
