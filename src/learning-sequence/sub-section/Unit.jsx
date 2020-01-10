import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

export default function Unit({ id, unit }) {
  const iframeRef = useRef(null);
  const iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}`;
  const { displayName } = unit;
  return (
    <iframe
      title={displayName}
      ref={iframeRef}
      src={iframeUrl}
    />
  );
}

Unit.propTypes = {
  id: PropTypes.string.isRequired,
  unit: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
  }).isRequired,
};
