import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';

import { getProgressTabUrl } from '../../../../course-tabs/utils';
import { useModel } from '../../../../generic/model-store';

import messages from './messages';

const HiddenAfterDue = ({ courseId }) => {
  const intl = useIntl();
  const { tabs } = useModel('courseHomeMeta', courseId);

  const progressTabUrl = getProgressTabUrl(tabs);
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

HiddenAfterDue.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default HiddenAfterDue;
