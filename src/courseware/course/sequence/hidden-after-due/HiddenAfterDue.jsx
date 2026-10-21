import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { useProgressTabUrl } from '../../../../course-tabs/hooks';

import messages from './messages';

const HiddenAfterDue = () => {
  const intl = useIntl();

  const progressTabUrl = useProgressTabUrl();
  const progressLink = progressTabUrl && (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={progressTabUrl}
      className="text-reset"
    >
      {intl.formatMessage(messages.progressPage)}
    </Hyperlink>
  );

  return (
    <Alert variant="info" icon={Info}>
      <h3>{intl.formatMessage(messages.header)}</h3>
      <p>
        {intl.formatMessage(messages.description)}
        {progressLink && (
          <>
            <br />
            <FormattedMessage
              {...messages.gradeAvailable}
              values={{
                progressPage: progressLink,
              }}
            />
          </>
        )}
      </p>
    </Alert>
  );
};

export default HiddenAfterDue;
