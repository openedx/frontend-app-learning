import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Alert, Button, Icon,
} from '@edx/paragon';
import { Locked } from '@edx/paragon/icons'; // Would also import Check if it gets fixed
import messages from './messages';
import certificateLocked from '../../../../generic/assets/edX_locked_certificate.png';
import { useModel } from '../../../../generic/model-store';

function LockPaywall({
  intl,
  courseId,
}) {
  const course = useModel('coursewareMeta', courseId);
  const {
    org,
    verifiedMode,
  } = course;

  if (!verifiedMode) {
    return null;
  }
  const {
    currencySymbol,
    price,
    upgradeUrl,
  } = verifiedMode;

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const logClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: '(none)',
      linkName: 'in_course_upgrade',
      linkType: 'link',
      pageName: 'in_course',
    });
  };

  const lockIcon = (
    <Icon
      className="float-left"
      src={Locked}
      aria-hidden="true"
      alt=""
      title="icon"
    />
  );

  const verifiedCertLink = (
    <Alert.Link
      href="https://www.edx.org/verified-certificate"
      target="_blank"
      rel="noopener noreferrer"
    >
      {intl.formatMessage(messages['learn.lockPaywall.list.bullet1.linktext'])}
    </Alert.Link>
  );

  const gradedAssignments = (
    <span className="font-weight-bold">
      {intl.formatMessage(messages['learn.lockPaywall.list.bullet2.boldtext'])}
    </span>
  );
  const fullAccess = (
    <span className="font-weight-bold">
      {intl.formatMessage(messages['learn.lockPaywall.list.bullet3.boldtext'])}
    </span>
  );
  const nonProfit = (
    <span className="font-weight-bold">
      {intl.formatMessage(messages['learn.lockPaywall.list.bullet4.boldtext'])}
    </span>
  );

  return (
    <div className="border border-gray rounded">
      <Alert variant="light">

        <div className="row">
          {/* Thin left-hand column for lock */}
          <div className="col-auto p-0">
            {lockIcon}
          </div>

          {/* One fat column for everything else */}
          <div className="col">
            <div>
              <h4>
                <span className="ml-2">{intl.formatMessage(messages['learn.lockPaywall.title'])}</span>
              </h4>

              {/* "Upgrade to gain access to locked features..." */}
              <div className="mb-2">
                {intl.formatMessage(messages['learn.lockPaywall.content'])}
              </div>

              {/* overall div for cert image, 'when you upgrade', bullets, button */}
              <div className="d-flex flex-row flex-wrap">
                <div style={{ float: 'left' }} className="mr-3 mb-2">
                  <img
                    alt={intl.formatMessage(messages['learn.lockPaywall.example.alt'])}
                    src={certificateLocked}
                    className="border-0 certificate-image-banner"
                    style={{ height: '128px', width: '175px' }}
                  />
                </div>

                {/* div for bulleted list */}
                <div className="mw-xs">
                  <div className="mb-2">
                    {intl.formatMessage(messages['learn.lockPaywall.list.intro'])}
                  </div>
                  <ul className="fa-ul">
                    <li>
                      <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                      <FormattedMessage
                        id="gatedContent.paragraph.bulletOne"
                        defaultMessage="Earn a {verifiedCertLink} of completion to showcase on your resume"
                        values={{ verifiedCertLink }}
                      />
                    </li>
                    <li>
                      <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                      <FormattedMessage
                        id="gatedContent.paragraph.bulletTwo"
                        defaultMessage="Unlock access to all course activities, including {gradedAssignments}"
                        values={{ gradedAssignments }}
                      />
                    </li>
                    <li>
                      <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                      <FormattedMessage
                        id="gatedContent.paragraph.bulletThree"
                        defaultMessage="{fullAccess} to course content and materials, even after the course ends"
                        values={{ fullAccess }}
                      />
                    </li>
                    <li>
                      <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                      <FormattedMessage
                        id="gatedContent.paragraph.bulletFour"
                        defaultMessage="Support our {nonProfit} mission at edX"
                        values={{ nonProfit }}
                      />
                    </li>
                  </ul>
                </div>
                <div className="d-flex align-items-center">
                  <Button
                    className="lock_paywall_upgrade_link"
                    href={upgradeUrl}
                    onClick={logClick}
                    style={{ verticalAlign: 'middle' }}
                  >
                    {intl.formatMessage(messages['learn.lockPaywall.upgrade.link'], {
                      currencySymbol,
                      price,
                    })}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </Alert>
    </div>
  );
}
LockPaywall.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};
export default injectIntl(LockPaywall);
