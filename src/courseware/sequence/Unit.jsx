import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

export default function Unit({ id, pageTitle }) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}`;

  const [iframeWidth, setIframeWidth] = useState(0);
  const [iframeHeight, setIframeHeight] = useState(0);
  useEffect(() => {
    global.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'plugin.resize') {
        setIframeWidth(payload.width);
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
      width={iframeWidth}
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
