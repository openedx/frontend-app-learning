import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { FormattedDate, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

import Footnote from './Footnote';
import { logClick } from './utils';
import messages from './messages';
import { useModel } from '../../../generic/model-store';

const UpgradeFootnote = ({ deadline, href }) => {
  const intl = useIntl();
  const { courseId } = useSelector(state => state.courseware);
  const { org } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();

  const upgradeLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={href}
      className="text-reset"
      onClick={() => logClick(org, courseId, administrator, 'upgrade_footnote')}
    >
      {intl.formatMessage(messages.upgradeLink)}
    </Hyperlink>
  );

  const expirationDate = (
    <FormattedDate
      day="numeric"
      month="long"
      year="numeric"
      value={deadline}
    />
  );

  return (
    <Footnote
      icon={faCalendarAlt}
      text={(
        <FormattedMessage
          id="courseExit.upgradeFootnote"
          defaultMessage="Access to this course and its materials are available on your dashboard until {expirationDate}. To extend access, {upgradeLink}."
          values={{
            expirationDate,
            upgradeLink,
          }}
          description="Message body to tell learner until when the materiel will be available, and to suggest to upgrade"
        />
      )}
    />
  );
};

UpgradeFootnote.propTypes = {
  deadline: PropTypes.instanceOf(Date).isRequired,
  href: PropTypes.string.isRequired,
};

export default UpgradeFootnote;
