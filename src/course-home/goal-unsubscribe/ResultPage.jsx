import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink } from '@edx/paragon';

import messages from './messages';
import { ReactComponent as UnsubscribeIcon } from './unsubscribe.svg';

function ResultPage({ courseTitle, error, intl }) {
  const errorDescription = (
    <FormattedMessage
      id="learning.goals.unsubscribe.errorDescription"
      defaultMessage="We were unable to unsubscribe you from goal reminder emails. Please try again later or {contactSupport} for help."
      values={{
        contactSupport: (
          <Hyperlink
            className="text-reset"
            style={{ textDecoration: 'underline' }}
            destination={`${getConfig().CONTACT_URL}`}
          >
            {intl.formatMessage(messages.contactSupport)}
          </Hyperlink>
        ),
      }}
    />
  );

  const header = error
    ? intl.formatMessage(messages.errorHeader)
    : intl.formatMessage(messages.header);
  const description = error
    ? errorDescription
    : intl.formatMessage(messages.description, { courseTitle });

  return (
    <>
      <UnsubscribeIcon className="text-primary" alt="" />
      <div role="heading" aria-level="1" className="h2">{header}</div>
      <div className="row justify-content-center">
        <div className="col-xl-7 col-12 p-0">{description}</div>
      </div>
      <Button variant="brand" href={`${getConfig().LMS_BASE_URL}/dashboard`} className="mt-4">
        {intl.formatMessage(messages.goToDashboard)}
      </Button>
    </>
  );
}

ResultPage.defaultProps = {
  courseTitle: null,
  error: false,
};

ResultPage.propTypes = {
  courseTitle: PropTypes.string,
  error: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(ResultPage);
