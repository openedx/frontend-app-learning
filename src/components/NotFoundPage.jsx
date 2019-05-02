import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function NotFoundPage() {
  return (
    <div className="container-fluid d-flex py-5 justify-content-center align-items-start text-center">
      <p className="my-0 py-5 text-muted" style={{ maxWidth: '32em' }}>
        <FormattedMessage
          id="error.notfound.message"
          defaultMessage="The page you're looking for is unavailable or there's an error in the URL. Please check the URL and try again."
          description="error message when a page does not exist"
        />
      </p>
    </div>
  );
}
