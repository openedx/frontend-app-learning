import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import parse from 'html-react-parser';

const HTMLRenderer = ({ html }) => {
  console.log({ html });
  return (<div dangerouslySetInnerHTML={{ __html: html }} />);
  // return parse(html);
};

HTMLRenderer.propTypes = {
  html: PropTypes.string.isRequired,
};

export default HTMLRenderer;
