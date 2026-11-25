import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@openedx/frontend-base';
import {
  ActionRow,
  breakpoints,
  Button,
  StandardModal,
  useWindowSize,
} from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import SocialIcons from '@src/courseware/social-share/SocialIcons';
import ClapsMobile from './assets/claps_280x201.gif';
import ClapsTablet from './assets/claps_456x328.gif';
import messages from './messages';
import { recordFirstSectionCelebration } from './utils';

const CelebrationModal = ({
  courseId, isOpen, onClose, ...rest
}) => {
  const intl = useIntl();
  const { org, celebrations } = useCourseHomeMeta(courseId, { enabled: false }).data ?? {};
  const queryClient = useQueryClient();
  const wideScreen = useWindowSize().width >= breakpoints.small.minWidth;

  useEffect(() => {
    if (isOpen) {
      recordFirstSectionCelebration(org, courseId, celebrations, queryClient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <StandardModal
      className="celebration-modal"
      footerNode={(
        <ActionRow isStacked className="pb-2">
          <Button onClick={onClose}>{intl.formatMessage(messages.forward)}</Button>
        </ActionRow>
      )}
      hasCloseButton={false}
      isOpen={isOpen}
      onClose={onClose}
      title={intl.formatMessage(messages.congrats)}
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
};

CelebrationModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CelebrationModal;
