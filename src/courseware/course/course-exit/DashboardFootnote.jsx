import React from 'react';

import {
  FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { getConfig } from '@edx/frontend-platform';

import Footnote from './Footnote';
import messages from './messages';

function DashboardFootnote({ intl }) {
  const dashboardLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/dashboard`}
      className="text-reset"
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );

  return (
    <Footnote
      icon={faCalendarAlt}
      text={(
        <FormattedMessage
          id="courseCelebration.dashboardInfo" // for historical reasons
          defaultMessage="You can access this course and its materials on your {dashboardLink}."
          values={{ dashboardLink }}
        />
      )}
    />
  );
}

DashboardFootnote.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DashboardFootnote);
