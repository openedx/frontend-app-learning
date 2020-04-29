import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '../user-messages';

function OfferAlert(props) {
  const {
    rawHtml,
  } = props;
  return rawHtml && (
    <Alert type="info">
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </Alert>
  );
}

OfferAlert.propTypes = {
  rawHtml: PropTypes.string.isRequired,
};

export default OfferAlert;
