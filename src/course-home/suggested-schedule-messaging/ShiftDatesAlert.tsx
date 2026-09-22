import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button,
  Row,
  Col,
} from '@openedx/paragon';

import { useResetDeadlines } from '../data/apiHooks';
import { courseHomeQueryKeys } from '../data/queryKeys';
import { useModel } from '../../generic/model-store';
import messages from './messages';

interface Props {
  model: string;
}

const ShiftDatesAlert = ({ model }: Props) => {
  const intl = useIntl();
  const { courseId } = useParams();
  const queryClient = useQueryClient();

  const {
    datesBannerInfo,
    hasEnded,
  } = useModel(model, courseId);

  const {
    missedDeadlines,
    missedGatedContent,
  } = datesBannerInfo;

  const resetDeadlines = useResetDeadlines();

  if (!courseId || !missedDeadlines || missedGatedContent || hasEnded) {
    return null;
  }

  const refreshTabData = () => {
    queryClient.invalidateQueries({ queryKey: courseHomeQueryKeys.datesTab(courseId) });
    queryClient.invalidateQueries({ queryKey: courseHomeQueryKeys.outlineTab(courseId) });
  };

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
            onClick={() => resetDeadlines.mutate(
              { courseId, model },
              { onSuccess: refreshTabData },
            )}
          >
            {intl.formatMessage(messages.shiftDatesButton)}
          </Button>
        </Col>
      </Row>
    </Alert>
  );
};

export default ShiftDatesAlert;
