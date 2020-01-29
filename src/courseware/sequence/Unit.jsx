import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

export default function Unit({ id, pageTitle }) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}`;

  const [iframeHeight, setIframeHeight] = useState(0);
  useEffect(() => {
    global.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'plugin.resize') {
        setIframeHeight(payload.height);
      }
    };
  }, []);

  return (
    <iframe
      title={pageTitle}
      ref={iframeRef}
      src={iframeUrl}
      allowFullScreen
      className="d-block container-fluid px-0"
      height={iframeHeight}
      scrolling="no"
      referrerPolicy="origin"
    />
  );
}

Unit.propTypes = {
  id: PropTypes.string.isRequired,
  pageTitle: PropTypes.string.isRequired,
};
