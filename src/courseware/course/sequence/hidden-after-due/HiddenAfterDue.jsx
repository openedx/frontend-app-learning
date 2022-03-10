import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

import { useModel } from '../../../../generic/model-store';

import messages from './messages';

function HiddenAfterDue({ courseId, intl }) {
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
              id="learn.hiddenAfterDue.gradeAvailable"
              defaultMessage="If you have completed this assignment, your grade is available on the {progressPage}."
              values={{
                progressPage: progressLink,
              }}
            />
          </>
        )}
      </p>
    </Alert>
  );
}

HiddenAfterDue.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(HiddenAfterDue);
