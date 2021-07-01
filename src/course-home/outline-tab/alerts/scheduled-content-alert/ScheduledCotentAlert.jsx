import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Button } from '@edx/paragon';
import React from 'react';

const ScheduledContentAlert = () => (
  <Alert variant="info">
    <div className="row justify-content-between align-items-center">
      <div className="col-lg-7">

        <Alert.Heading>
          <FormattedMessage
            id="learning.outline.alert.scheduled-content.heading"
            defaultMessage="More content is coming soon!"
          />
        </Alert.Heading>
        <FormattedMessage
          id="learning.outline.alert.scheduled-content.body"
          defaultMessage="This course will have more content released at a future date. look out for email updates or check back on this course for updates."
        />
      </div>
      <div className="m-auto m-lg-0 pr-lg-3">
        <Button>
          <FormattedMessage
            id="learning.outline.alert.scheduled-content.button"
            defaultMessage="View Course Schedule"
          />
        </Button>
      </div>
    </div>
  </Alert>
);

export default ScheduledContentAlert;
