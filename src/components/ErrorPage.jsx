import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function ErrorPage() {
  return (
    <div className="container-fluid py-5 justify-content-center align-items-start text-center">
      <div className="row">
        <div className="col">
          <p className="my-0 py-5 text-muted">
            <FormattedMessage
              id="error.unexpected.message"
              defaultMessage="An unexpected error occurred."
              description="error message when an unexpected error occurs"
            />
          </p>
        </div>
      </div>
    </div>
  );
}
