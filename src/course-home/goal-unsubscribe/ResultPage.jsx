import PropTypes from 'prop-types';
import {
  getLinkProps, getUrlByRouteRole, useAppConfig, useIntl,
} from '@openedx/frontend-base';
import { Button, Hyperlink } from '@openedx/paragon';

import { dashboardRole } from '@src/constants';

import UnsubscribeIcon from './UnsubscribeIcon';
import messages from './messages';

const ResultPage = ({ courseTitle = null, error = false }) => {
  const intl = useIntl();
  const { CONTACT_URL: contactUrl } = useAppConfig();
  const dashboardUrl = getUrlByRouteRole(dashboardRole);

  const contactSupport = intl.formatMessage(messages.contactSupport);
  const errorDescription = intl.formatMessage(
    messages.errorDescription,
    {
      contactSupport: contactUrl ? (
        <Hyperlink
          className="text-reset"
          style={{ textDecoration: 'underline' }}
          destination={contactUrl}
        >
          {contactSupport}
        </Hyperlink>
      ) : contactSupport,
    },
  );

  const header = error
    ? intl.formatMessage(messages.errorHeader)
    : intl.formatMessage(messages.header);
  const description = error
    ? errorDescription
    : intl.formatMessage(messages.description, { courseTitle });

  return (
    <>
      <UnsubscribeIcon className="text-primary" />
      <div role="heading" aria-level="1" className="h2">{header}</div>
      <div className="row justify-content-center">
        <div className="col-xl-7 col-12 p-0">{description}</div>
      </div>
      {dashboardUrl && (
        <Button variant="brand" {...getLinkProps(dashboardUrl)} className="mt-4">
          {intl.formatMessage(messages.goToDashboard)}
        </Button>
      )}
    </>
  );
};

ResultPage.propTypes = {
  courseTitle: PropTypes.string,
  error: PropTypes.bool,
};

export default ResultPage;
