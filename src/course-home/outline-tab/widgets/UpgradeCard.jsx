import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import messages from '../messages';
import { useModel } from '../../../generic/model-store';
import { UpgradeButton } from '../../../generic/upgrade-button';
import VerifiedCert from '../../../generic/assets/edX_certificate.png';

function UpgradeCard({ courseId, intl, onLearnMore }) {
  const { org } = useModel('courses', courseId);
  const {
    offer,
    verifiedMode,
  } = useModel('outline', courseId);

  if (!verifiedMode) {
    return null;
  }

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  useEffect(() => {
    sendTrackingLogEvent('edx.bi.course.upgrade.sidebarupsell.displayed', eventProperties);
  });

  const logClick = () => {
    sendTrackingLogEvent('edx.bi.course.upgrade.sidebarupsell.clicked', eventProperties);
    sendTrackingLogEvent('edx.course.enrollment.upgrade.clicked', {
      location: 'sidebar-message',
    });
  };

  return (
    <section className="mb-4 p-3 outline-sidebar-upgrade-card">
      <h2 className="h4" id="outline-sidebar-upgrade-header">{intl.formatMessage(messages.upgradeTitle)}</h2>
      <div className="row w-100 m-0">
        <div className="col-6 col-md-12 col-lg-3 col-xl-4 p-0 text-md-center text-lg-left">
          <img
            alt={intl.formatMessage(messages.certAlt)}
            className="w-100"
            src={VerifiedCert}
            style={{ maxWidth: '10rem' }}
          />
        </div>
        <div className="col-6 col-md-12 col-lg-9 col-xl-8 p-0 pl-lg-2 text-center mt-md-2 mt-lg-0">
          <div className="row w-100 m-0 justify-content-center">
            <UpgradeButton
              offer={offer}
              onClick={logClick}
              verifiedMode={verifiedMode}
            />
            {onLearnMore && (
              <div className="col-12">
                <Button
                  variant="link"
                  size="sm"
                  className="pb-0"
                  onClick={onLearnMore}
                  aria-labelledby="outline-sidebar-upgrade-header"
                >
                  {intl.formatMessage(messages.learnMore)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

UpgradeCard.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  onLearnMore: PropTypes.func,
};

UpgradeCard.defaultProps = {
  onLearnMore: null,
};

export default injectIntl(UpgradeCard);
