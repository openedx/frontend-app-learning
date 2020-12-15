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
    <section className="mb-4 p-4 outline-sidebar-upgrade-card">
      <h2 className="h6" id="outline-sidebar-upgrade-header">{intl.formatMessage(messages.upgradeTitle)}</h2>
      <img
        alt={intl.formatMessage(messages.certAlt)}
        src={VerifiedCert}
        style={{ width: '124px' }}
      />
      <div className="float-right d-flex flex-column align-items-center">
        <UpgradeButton
          offer={offer}
          onClick={logClick}
          verifiedMode={verifiedMode}
        />
        {onLearnMore && (
          <Button
            variant="link"
            size="sm"
            onClick={onLearnMore}
            aria-labelledby="outline-sidebar-upgrade-header"
          >
            {intl.formatMessage(messages.learnMore)}
          </Button>
        )}
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
