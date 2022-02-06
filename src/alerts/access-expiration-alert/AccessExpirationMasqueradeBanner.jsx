import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from '@edx/frontend-platform/i18n';
import { PageBanner } from '@edx/paragon';

function AccessExpirationMasqueradeBanner({ payload }) {
  const {
    expirationDate,
    userTimezone,
  } = payload;

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  return (
    <PageBanner variant="warning">
      <FormattedMessage
        id="instructorToolbar.pageBanner.courseHasExpired"
        defaultMessage="This learner no longer has access to this course. Their access expired on {date}."
        description="It's a warning that is shown to course author when being masqueraded as learner, while the course has expired for the real learner."
        values={{
          date: <FormattedDate
            key="instructorToolbar.pageBanner.accessExpirationDate"
            value={expirationDate}
            {...timezoneFormatArgs}
          />,
        }}
      />
    </PageBanner>
  );
}

AccessExpirationMasqueradeBanner.propTypes = {
  payload: PropTypes.shape({
    expirationDate: PropTypes.string.isRequired,
    userTimezone: PropTypes.string.isRequired,
  }).isRequired,
};

export default AccessExpirationMasqueradeBanner;
