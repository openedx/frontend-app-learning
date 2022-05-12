import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, MarketingModal, ModalDialog,
} from '@edx/paragon';

import heroImage from './course_home_tour_modal_hero.png';
import messages from '../messages';

function NewUserCourseHomeTourModal({
  intl,
  isOpen,
  onDismiss,
  onStartTour,
}) {
  return (
    <MarketingModal
      isOpen={isOpen}
      title="New user course home prompt"
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
                  siteName: getConfig().SITE_NAME,
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
      <p className="text-dark-900">{intl.formatMessage(messages.newUserModalBody, { siteName: getConfig().SITE_NAME })}</p>
    </MarketingModal>
  );
}

NewUserCourseHomeTourModal.propTypes = {
  intl: intlShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onStartTour: PropTypes.func.isRequired,
};

export default injectIntl(NewUserCourseHomeTourModal);
