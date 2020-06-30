import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '../../generic/user-messages';

function AccessExpirationAlert({ payload }) {
  const {
    rawHtml,
  } = payload;
  return rawHtml && (
    <Alert type="info">
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </Alert>
  );
}

AccessExpirationAlert.propTypes = {
  payload: PropTypes.shape({
    rawHtml: PropTypes.string.isRequired,
  }).isRequired,
};

export default AccessExpirationAlert;
