import React from 'react';
import PropTypes from 'prop-types';

import {
  FormattedDate, FormattedMessage, getAuthenticatedUser, useIntl,
} from '@openedx/frontend-base';
import { Hyperlink } from '@openedx/paragon';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

import Footnote from './Footnote';
import { logClick } from './utils';
import messages from './messages';
import { useCourseHomeMeta } from '../../../course-home/data/apiHooks';
import { useCourseId } from '@src/generic/course-params';

const UpgradeFootnote = ({ deadline, href }) => {
  const intl = useIntl();
  const courseId = useCourseId();
  const org = useCourseHomeMeta(courseId, { enabled: false }).data?.org;
  const { administrator } = getAuthenticatedUser();

  const upgradeLink = (
    <Hyperlink
      id="upgrade-link"
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
  // The course metadata carries the deadline as an ISO string.
  deadline: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]).isRequired,
  href: PropTypes.string.isRequired,
};

export default UpgradeFootnote;
