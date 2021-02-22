import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Lightbulb } from '@edx/paragon/icons';
import { Icon, Modal } from '@edx/paragon';
import { layoutGenerator } from 'react-break';
import { useDispatch } from 'react-redux';

import { useModel } from '../../generic/model-store';
import StreakMobileImage from './assets/Streak_mobile.png';
import StreakDesktopImage from './assets/Streak_desktop.png';
import messages from './messages';
import { recordModalClosing, recordStreakCelebration } from './utils';

function getRandomFactoid(intl, streakLength) {
  const boldedSectionA = intl.formatMessage(messages.streakFactoidABoldedSection);
  const boldedSectionB = intl.formatMessage(messages.streakFactoidBBoldedSection);
  const factoids = [
    (<FormattedMessage
      id="learning.streakcelebration.factoida"
      defaultMessage="Users who learn {streak_length} days in a row {bolded_section} than those who don’t."
      values={{
        bolded_section: (<b>{boldedSectionA}</b>),
        streak_length: (streakLength),
      }}
    />),
    (<FormattedMessage
      id="learning.streakcelebration.factoidb"
      defaultMessage="Users who learn {streak_length} days in a row {bolded_section} vs. those who don’t."
      values={{
        bolded_section: (<b>{boldedSectionB}</b>),
        streak_length: (streakLength),
      }}
    />),
  ];
  return factoids[Math.floor(Math.random() * (factoids.length))];
}

function StreakModal({
  courseId, metadataModel, streakLengthToCelebrate, intl, open, ...rest
}) {
  const { org, celebrations } = useModel(metadataModel, courseId);
  const factoid = getRandomFactoid(intl, streakLengthToCelebrate);
  // eslint-disable-next-line no-unused-vars
  const [randomFactoid, setRandomFactoid] = useState(factoid); // Don't change factoid on re-render

  const layout = layoutGenerator({
    mobile: 0,
    desktop: 575,
  });

  const OnMobile = layout.is('mobile');
  const OnDesktop = layout.isAtLeast('desktop');
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      recordStreakCelebration(org, courseId);
    }
  }, [open, org, courseId]);

  function CloseText() {
    return (
      <span>
        {intl.formatMessage(messages.streakButton)}
        <span className="sr-only">. {intl.formatMessage(messages.streakButtonSrOnly)}</span>
      </span>
    );
  }

  return (
    <div>
      <Modal
        dialogClassName="streak-modal modal-dialog-centered"
        body={(
          <>
            <p>{intl.formatMessage(messages.streakBody)}</p>
            <p className="modal-image">
              <OnMobile>
                <img src={StreakMobileImage} alt="" className="img-fluid" />
              </OnMobile>
              <OnDesktop>
                <img src={StreakDesktopImage} alt="" className="img-fluid" />
              </OnDesktop>
            </p>
            <div className="row mt-3 mx-3 py-3 bg-light-300">
              <Icon className="col-small ml-3" src={Lightbulb} />
              <div className="col-11 factoid-wrapper">
                {randomFactoid}
              </div>
            </div>
          </>
        )}
        closeText={<CloseText />}
        onClose={() => {
          recordModalClosing(metadataModel, celebrations, org, courseId, dispatch);
        }}
        open={open}
        title={`${streakLengthToCelebrate} ${intl.formatMessage(messages.streakHeader)}`}
        {...rest}
      />
    </div>
  );
}

StreakModal.defaultProps = {
  open: false,
};

StreakModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  metadataModel: PropTypes.string.isRequired,
  streakLengthToCelebrate: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
  open: PropTypes.bool,
};

export default injectIntl(StreakModal);
