import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { useModel } from '../../../../generic/model-store';

import messages from './messages';

const HiddenAfterDue = ({ courseId }) => {
  const intl = useIntl();
  const { tabs } = useModel('courseHomeMeta', courseId);

  const progressTab = tabs.find(tab => tab.slug === 'progress');
  const progressLink = progressTab && progressTab.url && (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={progressTab.url}
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

HiddenAfterDue.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default HiddenAfterDue;
