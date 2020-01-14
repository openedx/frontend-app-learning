import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

export default function Unit({ id, title }) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}`;

  return (
    <iframe
      className="flex-grow-1"
      title={title}
      ref={iframeRef}
      src={iframeUrl}
    />
  );
}

Unit.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
