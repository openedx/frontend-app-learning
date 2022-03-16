import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  breakpoints,
  Button,
  StandardModal,
  useWindowSize,
} from '@edx/paragon';

import ClapsMobile from './assets/claps_280x201.gif';
import ClapsTablet from './assets/claps_456x328.gif';
import messages from './messages';
import SocialIcons from '../../social-share/SocialIcons';
import { recordFirstSectionCelebration } from './utils';
import { useModel } from '../../../generic/model-store';

function CelebrationModal({
  courseId, intl, isOpen, onClose, ...rest
}) {
  const { org } = useModel('courseHomeMeta', courseId);
  const wideScreen = useWindowSize().width >= breakpoints.small.minWidth;

  useEffect(() => {
    if (isOpen) {
      recordFirstSectionCelebration(org, courseId);
    }
  }, [isOpen]);

  return (
    <StandardModal
      footerNode={(
        <ActionRow isStacked className="pb-2">
          <Button onClick={onClose}>{intl.formatMessage(messages.forward)}</Button>
        </ActionRow>
      )}
      hasCloseButton={false}
      isOpen={isOpen}
      onClose={onClose}
      title={(
        <p className="h2 text-center mr-n5 pt-4">{intl.formatMessage(messages.congrats)}</p>
      )}
      {...rest}
    >
      <>
        <p className="text-center">{intl.formatMessage(messages.completed)}</p>
        {!wideScreen && <img src={ClapsMobile} alt="" className="img-fluid" />}
        {wideScreen && <img src={ClapsTablet} alt="" className="img-fluid w-100" />}
        <p className="mt-3 text-center">
          <strong>{intl.formatMessage(messages.earned)}</strong> {intl.formatMessage(messages.share)}
        </p>
        <SocialIcons
          analyticsId="edx.ui.lms.celebration.social_share.clicked"
          courseId={courseId}
          emailSubject={messages.emailSubject}
          socialMessage={messages.socialMessage}
        />
      </>
    </StandardModal>
  );
}

CelebrationModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(CelebrationModal);
