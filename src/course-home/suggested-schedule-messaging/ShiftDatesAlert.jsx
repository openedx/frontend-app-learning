import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  Row,
  Col,
  breakpoints,
  useWindowSize,
} from '@openedx/paragon';

import { resetDeadlines } from '../data';
import { useModel } from '../../generic/model-store';
import messages from './messages';

const ShiftDatesAlert = ({ fetch, model }) => {
  const intl = useIntl();
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;

  const {
    datesBannerInfo,
    hasEnded,
  } = useModel(model, courseId);

  const {
    missedDeadlines,
    missedGatedContent,
  } = datesBannerInfo;

  const dispatch = useDispatch();

  if (!missedDeadlines || missedGatedContent || hasEnded) {
    return null;
  }

  return (
    <Alert variant="warning">
      <Row className="w-100 m-0">
        <Col
          xs={12}
          md={9}
          className={classNames('p-0 pr-md-2 shift-dates-alert-text', { small: !wideScreen })}
        >
          <strong>{intl.formatMessage(messages.missedDeadlines)}</strong>
          {' '}{intl.formatMessage(messages.shiftDatesBody)}
        </Col>
        <Col xs={12} md={3} className="align-self-center text-right mt-3 mt-md-0 p-0">
          <Button
            size={!wideScreen ? 'sm' : 'md'}
            className="w-xs-100 w-md-auto"
            onClick={() => dispatch(resetDeadlines(courseId, model, fetch))}
          >
            {intl.formatMessage(messages.shiftDatesButton)}
          </Button>
        </Col>
      </Row>
    </Alert>
  );
};

ShiftDatesAlert.propTypes = {
  fetch: PropTypes.func.isRequired,
  model: PropTypes.string.isRequired,
};

export default ShiftDatesAlert;
