import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, getSiteConfig, useIntl } from '@openedx/frontend-base';
import {
  ActionRow, Button, MarketingModal, ModalDialog,
} from '@openedx/paragon';

import heroImage from './assets/course_home_tour_modal_hero.png';
import messages from '../messages';

const NewUserCourseHomeTourModal = ({
  isOpen,
  onDismiss,
  onStartTour,
}) => {
  const intl = useIntl();
  const { siteName } = getSiteConfig();

  return (
    <MarketingModal
      isOpen={isOpen}
      title="New user course home prompt"
      className="new-user-tour-dialog"
      heroIsDark
      hasCloseButton={false}
      heroNode={(
        <ModalDialog.Hero>
          <ModalDialog.Hero.Background
            backgroundSrc={heroImage}
          />
          <ModalDialog.Hero.Content style={{ maxWidth: '20rem' }}>
            <ModalDialog.Title as="h2">
              <FormattedMessage
                id="tours.newUserModal.title"
                defaultMessage="{welcome} {siteName} course!"
                values={{
                  siteName,
                  welcome: <span className="text-accent-b">{intl.formatMessage(messages.newUserModalTitleWelcome)}</span>,
                }}
              />
            </ModalDialog.Title>
          </ModalDialog.Hero.Content>
        </ModalDialog.Hero>
        )}
      footerNode={(
        <ActionRow>
          <Button
            variant="tertiary"
            onClick={onDismiss}
          >
            {intl.formatMessage(messages.skipForNow)}
          </Button>
          <Button
            variant="brand"
            onClick={onStartTour}
          >
            {intl.formatMessage(messages.beginTour)}
          </Button>
        </ActionRow>
        )}
      onClose={onDismiss}
    >
      <p className="text-dark-900">{intl.formatMessage(messages.newUserModalBody, { siteName })}</p>
    </MarketingModal>
  );
};

NewUserCourseHomeTourModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onStartTour: PropTypes.func.isRequired,
};

export default NewUserCourseHomeTourModal;
