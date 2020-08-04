import React from 'react';
import PropTypes from 'prop-types';

import { Alert, ALERT_TYPES } from '../../generic/user-messages';

function OfferAlert({ payload }) {
  const {
    rawHtml,
  } = payload;
  return rawHtml && (
    <Alert type={ALERT_TYPES.INFO}>
      {/* eslint-disable-next-line react/no-danger */}
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
