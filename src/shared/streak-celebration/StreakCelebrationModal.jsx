import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Lightbulb, MoneyFilled } from '@edx/paragon/icons';
import {
  Alert, Icon, ModalDialog,
} from '@edx/paragon';
import { layoutGenerator } from 'react-break';
import { useDispatch } from 'react-redux';
import { UpgradeNowButton } from '../../generic/upgrade-button';

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
  courseId, metadataModel, streakLengthToCelebrate, intl, isStreakCelebrationOpen,
  closeStreakCelebration, StreakDiscountCouponEnabled, verifiedMode, ...rest
}) {
  if (!isStreakCelebrationOpen) {
    return null;
  }
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
    if (isStreakCelebrationOpen) {
      recordStreakCelebration(org, courseId);
    }
  }, [isStreakCelebrationOpen, org, courseId]);

  function CloseText() {
    return (
      <span>
        {intl.formatMessage(messages.streakButton)}
        <span className="sr-only">. {intl.formatMessage(messages.streakButtonSrOnly)}</span>
      </span>
    );
  }

  let upgradeUrl;
  let mode;
  let offer;

  if (verifiedMode) {
    upgradeUrl = `${verifiedMode.upgradeUrl}&code=ZGY11119949`;
    mode = {
      currencySymbol: verifiedMode.currencySymbol,
      price: verifiedMode.price,
      upgradeUrl,
    };

    offer = {
      discountedPrice: `${verifiedMode.currencySymbol}${(mode.price * 0.85).toFixed(2).toString()}`,
      originalPrice: `${verifiedMode.currencySymbol}${mode.price.toString()}`,
      upgradeUrl: mode.upgradeUrl,
    };
  }

  const title = `${streakLengthToCelebrate} ${intl.formatMessage(messages.streakHeader)}`;

  return (
    <ModalDialog
      className="streak-modal modal-dialog-centered"
      title={title}
      onClose={() => {
        closeStreakCelebration();
        recordModalClosing(metadataModel, celebrations, org, courseId, dispatch);
      }}
      isOpen={isStreakCelebrationOpen}
      isFullscreenScroll
      {...rest}
    >
      <ModalDialog.Header className="modal-header">
        <ModalDialog.Title className="mr-0 modal-title">
          {title}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className="modal-body">
        <p>{intl.formatMessage(messages.streakBody)}</p>
        <p className="modal-image">
          <OnMobile>
            <img src={StreakMobileImage} alt="" className="img-fluid" />
          </OnMobile>
          <OnDesktop>
            <img src={StreakDesktopImage} alt="" className="img-fluid" />
          </OnDesktop>
        </p>
        { !StreakDiscountCouponEnabled && (
          <div className="d-flex py-3 bg-light-300">
            <Icon className="col-small ml-3" src={Lightbulb} />
            <div className="col-11 factoid-wrapper">
              {randomFactoid}
            </div>
          </div>
        )}
        { StreakDiscountCouponEnabled && (
          <Alert variant="success" className="px-0">
            <div className="d-flex">
              <Icon className="col-small ml-3 text-success-500" src={MoneyFilled} />
              <div className="col-11 factoid-wrapper">
                <b>{intl.formatMessage(messages.congratulations)}</b>
                &nbsp;{intl.formatMessage(messages.streakDiscountMessage)}&nbsp;
                <FormattedMessage
                  id="learning.streakCelebration.streakCelebrationCouponEndDateMessage"
                  defaultMessage="Ends {date}."
                  values={{
                    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString({ timeZone: 'UTC' }),
                  }}
                />
              </div>
            </div>
          </Alert>
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer className="modal-footer d-block">
        { StreakDiscountCouponEnabled && (
          <>
            <OnMobile>
              <UpgradeNowButton
                className="upgrade mb-3"
                size="sm"
                offer={offer}
                variant="brand"
                verifiedMode={mode}
              />
              <ModalDialog.CloseButton variant="outline-brand" className="btn-sm">
                {intl.formatMessage(messages.streakButtonAA759)}
              </ModalDialog.CloseButton>
            </OnMobile>
            <OnDesktop>
              <UpgradeNowButton
                className="upgrade mb-3"
                offer={offer}
                variant="brand"
                verifiedMode={mode}
              />
              <ModalDialog.CloseButton variant="outline-brand">
                {intl.formatMessage(messages.streakButtonAA759)}
              </ModalDialog.CloseButton>
            </OnDesktop>
          </>
        )}
        { !StreakDiscountCouponEnabled && (
          <ModalDialog.CloseButton className="px-5" variant="primary"><CloseText /></ModalDialog.CloseButton>
        )}
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

StreakModal.defaultProps = {
  isStreakCelebrationOpen: false,
  streakLengthToCelebrate: -1,
  verifiedMode: {},
  StreakDiscountCouponEnabled: false,
};

StreakModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  metadataModel: PropTypes.string.isRequired,
  streakLengthToCelebrate: PropTypes.number,
  intl: intlShape.isRequired,
  isStreakCelebrationOpen: PropTypes.bool,
  closeStreakCelebration: PropTypes.func.isRequired,
  StreakDiscountCouponEnabled: PropTypes.bool,
  verifiedMode: PropTypes.shape({
    currencySymbol: PropTypes.string,
    price: PropTypes.number,
    upgradeUrl: PropTypes.string,
  }),
};

export default injectIntl(StreakModal);
