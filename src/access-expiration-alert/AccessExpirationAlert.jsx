import React from 'react';

import Alert from '../user-messages/Alert';

function AccessExpirationAlert(props) {
  const rawHtml = props.rawHtml;
  return rawHtml && (
    <Alert type="info">
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </Alert>
  );
}

export default AccessExpirationAlert;
