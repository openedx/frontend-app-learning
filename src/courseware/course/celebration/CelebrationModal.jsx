import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Modal } from '@edx/paragon';
import { layoutGenerator } from 'react-break';

import ClapsMobile from './assets/claps_280x201.gif';
import ClapsTablet from './assets/claps_456x328.gif';
import messages from './messages';
import SocialIcons from '../../social-share/SocialIcons';
import { recordFirstSectionCelebration } from './utils';
import { useModel } from '../../../generic/model-store';

function CelebrationModal({
  courseId, intl, open, ...rest
}) {
  const { org } = useModel('courses', courseId);

  const layout = layoutGenerator({
    mobile: 0,
    tablet: 400,
  });

  const OnMobile = layout.is('mobile');
  const OnAtLeastTablet = layout.isAtLeast('tablet');

  useEffect(() => {
    if (open) {
      recordFirstSectionCelebration(org, courseId);
    }
  }, [open]);

  return (
    <Modal
      body={(
        <>
          <p>{intl.formatMessage(messages.completed)}</p>
          <OnMobile>
            <img src={ClapsMobile} alt="" className="img-fluid" />
          </OnMobile>
          <OnAtLeastTablet>
            <img src={ClapsTablet} alt="" className="img-fluid w-100" />
          </OnAtLeastTablet>
          <p className="mt-3">
            <strong>{intl.formatMessage(messages.earned)}</strong> {intl.formatMessage(messages.share)}
          </p>
          <SocialIcons
            analyticsId="edx.ui.lms.celebration.social_share.clicked"
            courseId={courseId}
            emailSubject={messages.emailSubject}
            socialMessage={messages.socialMessage}
          />
        </>
      )}
      closeText={intl.formatMessage(messages.forward)}
      onClose={() => {}} // Don't do anything special, just having the modal close is enough (this is a required prop)
      open={open}
      title={intl.formatMessage(messages.congrats)}
      {...rest}
    />
  );
}

CelebrationModal.defaultProps = {
  open: false,
};

CelebrationModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  open: PropTypes.bool,
};

export default injectIntl(CelebrationModal);
