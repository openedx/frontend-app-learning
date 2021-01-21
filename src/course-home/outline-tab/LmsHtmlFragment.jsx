import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';

export default function LmsHtmlFragment({
  className,
  html,
  title,
  ...rest
}) {
  const wholePage = `
    <html>
      <head>
        <base href="${getConfig().LMS_BASE_URL}" target="_parent">
        <link rel="stylesheet" href="/static/css/bootstrap/lms-main.css">
        <link rel="stylesheet" type="text/css" href="${getConfig().BASE_URL}/src/course-home/outline-tab/LmsHtmlFragment.css">
      </head>
      <body class="${className}">${html}</body>
    </html>
  `;

  const iframe = useRef(null);
  function handleLoad() {
    iframe.current.height = iframe.current.contentWindow.document.body.scrollHeight;
  }

  return (
    <iframe
      className="w-100 border-0"
      onLoad={handleLoad}
      ref={iframe}
      referrerPolicy="origin"
      scrolling="no"
      srcDoc={wholePage}
      title={title}
      {...rest}
    />
  );
}

LmsHtmlFragment.defaultProps = {
  className: '',
};

LmsHtmlFragment.propTypes = {
  className: PropTypes.string,
  html: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
