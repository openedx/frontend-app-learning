import { FormattedMessage, getLinkProps } from '@openedx/frontend-base';
import { Alert, Button } from '@openedx/paragon';
import React from 'react';
import PropTypes from 'prop-types';

const ScheduledContentAlert = ({ payload }) => {
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
              description="Heading of the alert shown when the course has content scheduled for release later"
            />
          </Alert.Heading>
          <FormattedMessage
            id="learning.outline.alert.scheduled-content.body"
            defaultMessage="This course will have more content released at a future date. Look out for email updates or check back on this course for updates."
            description="Body of the alert shown when the course has content scheduled for release later"
          />
        </div>
        <div className="flex-grow-0 pt-3 pt-lg-0">
          {datesTabLink && (
            <Button
              {...getLinkProps(datesTabLink)}
            >
              <FormattedMessage
                id="learning.outline.alert.scheduled-content.button"
                defaultMessage="View Course Schedule"
                description="Button that opens the dates tab, in the alert about content scheduled for release later"
              />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

ScheduledContentAlert.propTypes = {
  payload: PropTypes.shape({
    datesTabLink: PropTypes.string,
  }).isRequired,
};

export default ScheduledContentAlert;
