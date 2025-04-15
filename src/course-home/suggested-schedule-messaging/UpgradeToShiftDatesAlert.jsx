import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  Row,
  Col,
} from '@openedx/paragon';

import { useModel } from '../../generic/model-store';
import messages from './messages';

const UpgradeToShiftDatesAlert = ({ logUpgradeLinkClick, model }) => {
  const intl = useIntl();
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    datesBannerInfo,
    hasEnded,
  } = useModel(model, courseId);

  const {
    contentTypeGatingEnabled,
    missedDeadlines,
    missedGatedContent,
    verifiedUpgradeLink,
  } = datesBannerInfo;

  if (!(contentTypeGatingEnabled && missedDeadlines && missedGatedContent && verifiedUpgradeLink) || hasEnded) {
    return null;
  }

  return (
    <Alert className="bg-light-200">
      <Row className="w-100 m-0">
        <Col xs={12} md={9} className="small p-0 pr-md-2">
          <strong>{intl.formatMessage(messages.missedDeadlines)}</strong>
          {' '}{intl.formatMessage(messages.upgradeToShiftBody)}
        </Col>
        <Col xs={12} md={3} className="align-self-center text-right mt-3 mt-md-0 p-0">
          <Button
            variant="brand"
            size="sm"
            className="w-xs-100 w-md-auto"
            onClick={() => {
              logUpgradeLinkClick();
              global.location.replace(verifiedUpgradeLink);
            }}
          >
            {intl.formatMessage(messages.upgradeToShiftButton)}
          </Button>
        </Col>
      </Row>
    </Alert>
  );
};

UpgradeToShiftDatesAlert.propTypes = {
  logUpgradeLinkClick: PropTypes.func,
  model: PropTypes.string.isRequired,
};

UpgradeToShiftDatesAlert.defaultProps = {
  logUpgradeLinkClick: () => {},
};

export default UpgradeToShiftDatesAlert;
