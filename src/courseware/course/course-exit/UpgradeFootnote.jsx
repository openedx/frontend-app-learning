import React from 'react';
import PropTypes from 'prop-types';

import {
  FormattedDate, FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

import Footnote from './Footnote';
import messages from './messages';

function UpgradeFootnote({ deadline, href, intl }) {
  const upgradeLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={href}
      className="text-reset"
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
        />
      )}
    />
  );
}

UpgradeFootnote.propTypes = {
  deadline: PropTypes.instanceOf(Date).isRequired,
  href: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(UpgradeFootnote);
