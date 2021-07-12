import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Button } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';

function ScheduledContentAlert({ payload }) {
  const {
    datesTabLink,
  } = payload;

  return (
    <Alert variant="info">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center">
        <div className="col-lg-7">
          <Alert.Heading>
            <FormattedMessage
              id="learning.outline.alert.scheduled-content.heading"
              defaultMessage="More content is coming soon!"
            />
          </Alert.Heading>
          <FormattedMessage
            id="learning.outline.alert.scheduled-content.body"
            defaultMessage="This course will have more content released at a future date. Look out for email updates or check back on this course for updates."
          />
        </div>
        <div className="flex-grow-0 pt-3 pt-lg-0">
          {datesTabLink && (
            <Button
              href={datesTabLink}
            >
              <FormattedMessage
                id="learning.outline.alert.scheduled-content.button"
                defaultMessage="View Course Schedule"
              />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

ScheduledContentAlert.propTypes = {
  payload: PropTypes.shape({
    datesTabLink: PropTypes.string,
  }).isRequired,
};

export default ScheduledContentAlert;
