import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import {
  getLocale, isRtl,
} from '@edx/frontend-platform/i18n';

const LmsHtmlFragment = ({
  className,
  html,
  title,
  ...rest
}) => {
  const isLocaleRtl = isRtl(getLocale());
  const wholePage = `
    <html dir=${isLocaleRtl ? 'rtl' : 'ltr'}>
      <head>
        <base href="${getConfig().LMS_BASE_URL}" target="_parent">
        <link rel="stylesheet" href="/static/${getConfig().LEGACY_THEME_NAME ? `${getConfig().LEGACY_THEME_NAME}/` : ''}css/bootstrap/lms-main.css">
        <link rel="stylesheet" type="text/css" href="${getConfig().BASE_URL}/static/LmsHtmlFragment.css">
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
      iframe.current.height = iframe.current.contentWindow.document.body.scrollHeight;
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

LmsHtmlFragment.defaultProps = {
  className: '',
};

LmsHtmlFragment.propTypes = {
  className: PropTypes.string,
  html: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default LmsHtmlFragment;
