/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Lightbulb, MoneyFilled } from '@openedx/paragon/icons';
import {
  Alert, breakpoints, Icon, ModalDialog, Spinner, useWindowSize,
} from '@openedx/paragon';
import { useDispatch } from 'react-redux';
import { UpgradeNowButton } from '../../generic/upgrade-button';

import { useModel } from '../../generic/model-store';
import StreakMobileImage from './assets/Streak_mobile.png';
import StreakDesktopImage from './assets/Streak_desktop.png';
import messages from './messages';
import {
  calculateVoucherDiscountPercentage,
  getDiscountCodePercentage,
  recordModalClosing,
  recordStreakCelebration,
} from './utils';

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

const CloseText = ({ intl }) => (
  <span>
    {intl.formatMessage(messages.streakButton)}
    <span className="sr-only">. {intl.formatMessage(messages.streakButtonSrOnly)}</span>
  </span>
);

const StreakModal = ({
  courseId, metadataModel, streakLengthToCelebrate, isStreakCelebrationOpen,
  closeStreakCelebration, streakDiscountCouponEnabled, verifiedMode, ...rest
}) => {
  const intl = useIntl();
  const { org, celebrations, username } = useModel('courseHomeMeta', courseId);
  const factoid = getRandomFactoid(intl, streakLengthToCelebrate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [randomFactoid, setRandomFactoid] = useState(factoid); // Don't change factoid on re-render

  // Open edX Folks: if you create a voucher with this code, the MFE will notice and show the discount
  const discountCode = 'ZGY11119949';
  // Negative means "we don't know yet" vs zero meaning no discount available
  const [discountPercent, setDiscountPercent] = useState(-1);
  const queryingDiscount = discountPercent < 0;

  const wideScreen = useWindowSize().width >= breakpoints.small.minWidth;
  const dispatch = useDispatch();

  useEffect(() => {
    if (isStreakCelebrationOpen) {
      recordStreakCelebration(org, courseId);
    }
  }, [isStreakCelebrationOpen, org, courseId]);

  // Ask ecommerce to calculate discount savings
  useEffect(() => {
    (async () => {
      let streakDiscountPercentage = 0;
      try {
        if (streakDiscountCouponEnabled && verifiedMode) {
          // If the discount service is available, use it to get the discount percentage
          if (getConfig().DISCOUNT_CODE_INFO_URL) {
            streakDiscountPercentage = await getDiscountCodePercentage(
              discountCode,
              courseId,
            );
          // If the discount service is not available, fall back to ecommerce to calculate the discount percentage
          } else if (getConfig().ECOMMERCE_BASE_URL) {
            streakDiscountPercentage = await calculateVoucherDiscountPercentage(
              discountCode,
              verifiedMode.sku,
              username,
            );
          }
        }
      } catch {
        // ignore any errors - we just won't show the discount to the user then
      } finally {
        if (streakDiscountPercentage) {
          sendTrackEvent('edx.bi.course.streak_discount_enabled', {
            course_id: courseId,
            sku: verifiedMode.sku,
          });
        }
        setDiscountPercent(streakDiscountPercentage);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streakDiscountCouponEnabled, username, verifiedMode]);

  if (!isStreakCelebrationOpen) {
    return null;
  }

  let upgradeUrl;
  let mode;
  let offer;

  if (verifiedMode) {
    upgradeUrl = `${verifiedMode.upgradeUrl}`;
    mode = {
      currencySymbol: verifiedMode.currencySymbol,
      price: verifiedMode.price,
      upgradeUrl,
    };

    if (discountPercent > 0) {
      const discountMultipler = 1 - discountPercent;
      offer = {
        discountedPrice: `${verifiedMode.currencySymbol}${(mode.price * discountMultipler).toFixed(2).toString()}`,
        originalPrice: `${verifiedMode.currencySymbol}${mode.price.toString()}`,
        upgradeUrl: `${mode.upgradeUrl}&code=${discountCode}`,
      };
    }
  }

  const title = `${streakLengthToCelebrate} ${intl.formatMessage(messages.streakHeader)}`;
  const showOffer = offer && streakDiscountCouponEnabled;

  return (
    <ModalDialog
      className="streak-modal modal-dialog-centered"
      title={title}
      onClose={() => {
        closeStreakCelebration();
        recordModalClosing(celebrations, org, courseId, dispatch);
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
        <p className="text-center">{intl.formatMessage(messages.streakBody)}</p>
        <p className="modal-image text-center">
          {!wideScreen && <img src={StreakMobileImage} alt="" className="img-fluid" />}
          {wideScreen && <img src={StreakDesktopImage} alt="" className="img-fluid" />}
        </p>
        { queryingDiscount && (
          <Spinner animation="border" variant="primary" />
        )}
        { !queryingDiscount && !showOffer && (
          <div className="d-flex py-3 bg-light-300">
            <Icon className="col-small ml-3" src={Lightbulb} />
            <div className="col-11 factoid-wrapper">
              {randomFactoid}
            </div>
          </div>
        )}
        { !queryingDiscount && showOffer && (
          <Alert variant="success" className="px-0">
            <div className="d-flex">
              <Icon className="col-small ml-3 text-success-500" src={MoneyFilled} />
              <div className="col-11 factoid-wrapper">
                <b>{intl.formatMessage(messages.congratulations)}</b>
                &nbsp;{intl.formatMessage(messages.streakDiscountMessage, {
                  percent: (discountPercent * 100).toFixed(0),
                })}&nbsp;
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
        { !queryingDiscount && showOffer && (
          <>
            {!wideScreen && (
              <>
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
              </>
            )}
            {wideScreen && (
              <>
                <UpgradeNowButton
                  className="upgrade mb-3"
                  offer={offer}
                  variant="brand"
                  verifiedMode={mode}
                />
                <ModalDialog.CloseButton variant="outline-brand">
                  {intl.formatMessage(messages.streakButtonAA759)}
                </ModalDialog.CloseButton>
              </>
            )}
          </>
        )}
        { !queryingDiscount && !showOffer && (
          <ModalDialog.CloseButton className="px-5" variant="primary"><CloseText intl={intl} /></ModalDialog.CloseButton>
        )}
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

StreakModal.defaultProps = {
  isStreakCelebrationOpen: false,
  streakDiscountCouponEnabled: false,
  streakLengthToCelebrate: -1,
  verifiedMode: {},
};

StreakModal.propTypes = {
  courseId: PropTypes.string.isRequired,
  metadataModel: PropTypes.string.isRequired,
  streakLengthToCelebrate: PropTypes.number,
  isStreakCelebrationOpen: PropTypes.bool,
  closeStreakCelebration: PropTypes.func.isRequired,
  streakDiscountCouponEnabled: PropTypes.bool,
  verifiedMode: PropTypes.shape({
    currencySymbol: PropTypes.string,
    price: PropTypes.number,
    sku: PropTypes.string,
    upgradeUrl: PropTypes.string,
  }),
};

export default StreakModal;
