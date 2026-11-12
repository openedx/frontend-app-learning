import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { getAppConfig, getSiteConfig } from '@openedx/frontend-base';

import { appId } from '@src/constants';

const LmsHtmlFragment = ({
  className = '',
  html,
  title,
  ...rest
}) => {
  const direction = document.documentElement?.getAttribute('dir') || 'ltr';
  const wholePage = `
    <html dir="${direction}">
      <head>
        <base href="${getSiteConfig().lmsBaseUrl}" target="_parent">
        <link rel="stylesheet" href="/static/${getAppConfig(appId).LEGACY_THEME_NAME ? `${getAppConfig(appId).LEGACY_THEME_NAME}/` : ''}css/bootstrap/lms-main.css">
        <style>
          body a {
            color: #00688D;
          }

          body.inline-link a {
            text-decoration: underline;
          }

          body.small {
            font-size: 0.875rem;
          }
        </style>
      </head>
      <body class="${className}">${html}</body>
      <script>
        const resizer = new ResizeObserver(() => {
          window.parent.postMessage({type: 'lmshtmlfragment.resize'}, '*');
        });
        resizer.observe(document.body);
      </script>
    </html>
  `;

  const iframe = useRef(null);
  function resetIframeHeight() {
    if (iframe?.current?.contentWindow?.document?.body) {
      iframe.current.height = iframe.current.contentWindow.document.body.parentNode.scrollHeight;
    }
  }

  useEffect(() => {
    function receiveMessage(event) {
      const { type } = event.data;
      if (type === 'lmshtmlfragment.resize') {
        resetIframeHeight();
      }
    }
    global.addEventListener('message', receiveMessage);
  }, []);

  return (
    <iframe
      className="w-100 border-0"
      onLoad={resetIframeHeight}
      ref={iframe}
      referrerPolicy="origin"
      scrolling="no"
      srcDoc={wholePage}
      title={title}
      {...rest}
    />
  );
};

LmsHtmlFragment.propTypes = {
  className: PropTypes.string,
  html: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default LmsHtmlFragment;
