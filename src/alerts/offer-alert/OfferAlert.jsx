import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '../../user-messages';

function OfferAlert({ payload }) {
  const {
    rawHtml,
  } = payload;
  return rawHtml && (
    <Alert type="info">
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </Alert>
  );
}

OfferAlert.propTypes = {
  payload: PropTypes.shape({
    rawHtml: PropTypes.string.isRequired,
  }).isRequired,
};

export default OfferAlert;
