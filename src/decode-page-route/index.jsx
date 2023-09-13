import PropTypes from 'prop-types';
import { PageWrap } from '@edx/frontend-platform/react';
import React from 'react';
import {
  generatePath, useMatch, Navigate,
} from 'react-router-dom';

import { DECODE_ROUTES } from '../constants';

const ROUTES = [].concat(
  ...Object.values(DECODE_ROUTES).map(value => (Array.isArray(value) ? value : [value])),
);

export const decodeUrl = (encodedUrl) => {
  const decodedUrl = decodeURIComponent(encodedUrl);
  if (encodedUrl === decodedUrl) {
    return encodedUrl;
  }
  return decodeUrl(decodedUrl);
};

const DecodePageRoute = ({ children }) => {
  let computedMatch = null;

  ROUTES.forEach((route) => {
    const matchedRoute = useMatch(route);
    if (matchedRoute) { computedMatch = matchedRoute; }
  });

  if (computedMatch) {
    const { pathname, pattern, params } = computedMatch;

    Object.keys(params).forEach((param) => {
      // only decode params not the entire url.
      // it is just to be safe and less prone to errors
      params[param] = decodeUrl(params[param]);
    });

    const newUrl = generatePath(pattern.path, params);

    // if the url get decoded, reroute to the decoded url
    if (newUrl !== pathname) {
      return <Navigate to={newUrl} replace />;
    }
  }

  return <PageWrap> {children} </PageWrap>;
};

DecodePageRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DecodePageRoute;
