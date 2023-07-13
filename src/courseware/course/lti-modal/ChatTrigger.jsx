import React, { useState } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Icon,
  useToggle,
  OverlayTrigger,
  Popover,
} from '@edx/paragon';
import { ChatBubbleOutline } from '@edx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import messages from './messages';

const ChatTrigger = ({
  intl,
  enrollmentMode,
  isStaff,
  launchUrl,
  courseId,
}) => {
  const [isOpen, open, close] = useToggle(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const { userId } = getAuthenticatedUser();

  const VERIFIED_MODES = [
    'professional',
    'verified',
    'no-id-professional',
    'credit',
    'masters',
    'executive-education',
  ];

  const isVerifiedEnrollmentMode = (
    enrollmentMode !== null
    && enrollmentMode !== undefined
    && VERIFIED_MODES.some(mode => mode === enrollmentMode)
  );

  const shouldDisplayChat = (
    launchUrl
    && (isVerifiedEnrollmentMode || isStaff) // display only to non-audit or staff
  );

  const handleOpen = () => {
    if (!hasOpenedChat) {
      setHasOpenedChat(true);
    }
    open();
    sendTrackEvent('edx.ui.lms.lti_modal.opened', {
      course_id: courseId,
      user_id: userId,
      is_staff: isStaff,
    });
  };

  return (
    <>
      {shouldDisplayChat && (
        <div
          className={classNames('mt-3', 'd-flex', 'ml-auto')}
        >
          <OverlayTrigger
            trigger="click"
            key="top"
            show={!hasOpenedChat}
            overlay={(
              <Popover id="popover-chat-information">
                <Popover.Title as="h3">{intl.formatMessage(messages.popoverTitle)}</Popover.Title>
                <Popover.Content>
                  {intl.formatMessage(messages.popoverContent)}
                </Popover.Content>
              </Popover>
            )}
          >
            <button
              className="border border-light-400 bg-transparent align-items-center align-content-center d-flex"
              type="button"
              onClick={handleOpen}
              aria-label={intl.formatMessage(messages.openChatModalTrigger)}
            >
              <div className="icon-container d-flex position-relative align-items-center">
                <Icon src={ChatBubbleOutline} className="m-0 m-auto" />
              </div>
            </button>
          </OverlayTrigger>
          <ModalDialog
            onClose={close}
            isOpen={isOpen}
            title={intl.formatMessage(messages.modalTitle)}
            size="xl"
            hasCloseButton
          >
            <ModalDialog.Header>
              <ModalDialog.Title>
                {intl.formatMessage(messages.modalTitle)}
              </ModalDialog.Title>
            </ModalDialog.Header>
            <ModalDialog.Body>
              <iframe
                src={launchUrl}
                allowFullScreen
                style={{
                  width: '100%',
                  height: '60vh',
                }}
                title={intl.formatMessage(messages.modalTitle)}
              />
            </ModalDialog.Body>
          </ModalDialog>
        </div>
      )}
    </>
  );
};

ChatTrigger.propTypes = {
  intl: intlShape.isRequired,
  isStaff: PropTypes.bool.isRequired,
  enrollmentMode: PropTypes.string,
  launchUrl: PropTypes.string,
  courseId: PropTypes.string.isRequired,
};

ChatTrigger.defaultProps = {
  launchUrl: null,
  enrollmentMode: null,
};

export default injectIntl(ChatTrigger);
