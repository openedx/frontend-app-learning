import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  Row,
  Col,
} from '@edx/paragon';

import { resetDeadlines } from '../data';
import { useModel } from '../../generic/model-store';
import messages from './messages';

function ShiftDatesAlert({ fetch, intl, model }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    datesBannerInfo,
    hasEnded,
  } = useModel(model, courseId);

  const {
    missedDeadlines,
    missedGatedContent,
  } = datesBannerInfo;

  if (!missedDeadlines || missedGatedContent || hasEnded) {
    return null;
  }

  const dispatch = useDispatch();

  return (
    <Alert variant="warning">
      <Row className="w-100 m-0">
        <Col xs={12} md={9} className="small p-0 pr-md-2">
          <strong>{intl.formatMessage(messages.missedDeadlines)}</strong>
          {' '}{intl.formatMessage(messages.shiftDatesBody)}
        </Col>
        <Col xs={12} md={3} className="align-self-center text-right mt-3 mt-md-0 p-0">
          <Button
            variant="primary"
            size="sm"
            className="w-xs-100 w-md-auto"
            onClick={() => dispatch(resetDeadlines(courseId, model, fetch))}
          >
            {intl.formatMessage(messages.shiftDatesButton)}
          </Button>
        </Col>
      </Row>
    </Alert>
  );
}

ShiftDatesAlert.propTypes = {
  fetch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  model: PropTypes.string.isRequired,
};

export default injectIntl(ShiftDatesAlert);
