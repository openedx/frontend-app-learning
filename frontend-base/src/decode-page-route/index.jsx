import PropTypes from 'prop-types';
import { PageWrap } from '@openedx/frontend-base';
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

export const decodeUrl = (encodedUrl) => {
  const decodedUrl = decodeURIComponent(encodedUrl);
  if (encodedUrl === decodedUrl) {
    return encodedUrl;
  }
  return decodeUrl(decodedUrl);
};

const DecodePageRoute = ({ children }) => {
  const { pathname } = useLocation();
  const newUrl = pathname.split('/').map(decodeUrl).join('/');

  // if the url get decoded, reroute to the decoded url
  if (newUrl !== pathname) {
    return <Navigate to={newUrl} replace />;
  }

  return <PageWrap> {children} </PageWrap>;
};

DecodePageRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DecodePageRoute;
