import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  AlertModal,
  Button,
  Spinner,
  Icon,
} from '@edx/paragon';
import { Check, ArrowForward } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { sendActivationEmail } from '../../courseware/data';
import messages from './messages';

function AccountActivationAlert({
  intl,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const handleOnClick = () => {
    setShowSpinner(true);
    setShowCheck(false);
    sendActivationEmail().then(() => {
      setShowSpinner(false);
      setShowCheck(true);
    });
  };

  const showAccountActivationAlert = Cookies.get('show-account-activation-popup');
  if (showAccountActivationAlert !== undefined) {
    Cookies.remove('show-account-activation-popup', { path: '/', domain: process.env.SESSION_COOKIE_DOMAIN });
    // extra check to make sure cookie was removed before updating the state. Updating the state without removal
    // of cookie would make it infinite rendering
    if (Cookies.get('show-account-activation-popup') === undefined) {
      setShowModal(true);
    }
  }

  const button = (
    <Button
      variant="primary"
      className=""
      onClick={() => setShowModal(false)}
    >
      <FormattedMessage
        id="account-activation.alert.button"
        defaultMessage="Continue to {siteName}"
        description="account activation alert continue button"
        values={{
          siteName: getConfig().SITE_NAME,
        }}
      />
      <Icon src={ArrowForward} className="ml-1 d-inline-block align-bottom" />
    </Button>
  );

  const children = () => {
    let bodyContent;
    const message = (
      <FormattedMessage
        id="account-activation.alert.message"
        defaultMessage="We sent an email to {boldEmail} with a link to activate your account. Can’t find it? Check your spam folder or
        {sendEmailTag}."
        description="Message for account activation alert which is shown after the registration"
        values={{
          boldEmail: <b>{getAuthenticatedUser() && getAuthenticatedUser().email}</b>,
          sendEmailTag: (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a href="#" role="button" onClick={handleOnClick}>
              <FormattedMessage
                id="account-activation.resend.link"
                defaultMessage="resend the email"
                description="Message for resend link in account activation alert which is shown after the registration"
              />
            </a>
          ),
        }}
      />
    );
    bodyContent = (
      <div>
        {message}
      </div>
    );

    if (!showCheck && showSpinner) {
      bodyContent = (
        <div>
          {message}
          <Spinner
            animation="border"
            variant="secondary"
            style={{ height: '1.5rem', width: '1.5rem' }}
          />
        </div>
      );
    }

    if (showCheck && !showSpinner) {
      bodyContent = (
        <div>
          {message}
          <Icon
            src={Check}
            style={{ height: '1.7rem', width: '1.25rem' }}
            className="text-success-500 d-inline-block position-fixed"
          />
        </div>
      );
    }
    return bodyContent;
  };

  return (
    <AlertModal
      isOpen={showModal}
      title={intl.formatMessage(messages.accountActivationAlertTitle)}
      footerNode={button}
      onClose={() => ({})}
    >
      {children()}
    </AlertModal>
  );
}

AccountActivationAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AccountActivationAlert);
