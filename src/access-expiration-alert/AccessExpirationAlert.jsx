import React from 'react';
import PropTypes from 'prop-types';

import Alert from '../user-messages/Alert';

function AccessExpirationAlert(props) {
  const {
    rawHtml,
  } = props;
  return rawHtml && (
    <Alert type="info">
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </Alert>
  );
}

AccessExpirationAlert.propTypes = {
  rawHtml: PropTypes.string.isRequired,
};

export default AccessExpirationAlert;
