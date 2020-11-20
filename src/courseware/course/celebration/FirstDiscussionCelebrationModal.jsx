import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Modal } from '@edx/paragon';
import { layoutGenerator } from 'react-break';
import { useDispatch } from 'react-redux';

import ClapsMobile from './assets/claps_280x201.gif';
import ClapsTablet from './assets/claps_456x328.gif';
import messages from './messages';
import { recordFirstDiscussionCelebration } from './utils';
import { updateModel } from '../../../generic/model-store';

function FirstDiscussionCelebrationModal({
  courseId, firstDiscussionUserBucket, intl, open, ...rest
}) {
  const dispatch = useDispatch();
  const layout = layoutGenerator({
    mobile: 0,
    tablet: 400,
  });

  const OnMobile = layout.is('mobile');
  const OnAtLeastTablet = layout.isAtLeast('tablet');

  useEffect(() => {
    if (open) {
      recordFirstDiscussionCelebration(courseId);
    }
  }, [open]);

  let normativeDataBodyText;
  // Bucket 2 corresponds to showing normative data in the body text
  if (firstDiscussionUserBucket === 0) {
    if (Math.random() > 0.5) {
      normativeDataBodyText = (<p className="mt-3">{intl.formatMessage(messages.discussionBodyText1)}</p>);
    } else {
      normativeDataBodyText = (<p className="mt-3">{intl.formatMessage(messages.discussionBodyText2)}</p>);
    }
  }

  console.log('normativeDataBodyText:', normativeDataBodyText);

  return (
    <Modal
      body={(
        <>
          <p>{intl.formatMessage(messages.conversation)}</p>
          <OnMobile>
            <img src={ClapsMobile} alt="" className="img-fluid" />
          </OnMobile>
          <OnAtLeastTablet>
            <img src={ClapsTablet} alt="" className="img-fluid w-100" />
          </OnAtLeastTablet>
          {normativeDataBodyText}
        </>
      )}
      closeText={intl.formatMessage(messages.keepItUp)}
      onClose={() => {
        // Update our local copy of course data from LMS
        console.log('updating model');
        dispatch(updateModel({
          modelType: 'courses',
          model: {
            id: courseId,
            celebrations: {
              firstDiscussion: false,
            },
          },
        }));
      }}
      open={open}
      title={intl.formatMessage(messages.firstDiscussionPost)}
      {...rest}
    />
  );
}

FirstDiscussionCelebrationModal.defaultProps = {
  open: false,
  firstDiscussionUserBucket: 2,
};

FirstDiscussionCelebrationModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  firstDiscussionUserBucket: PropTypes.number,
  intl: intlShape.isRequired,
  open: PropTypes.bool,
};

export default injectIntl(FirstDiscussionCelebrationModal);
