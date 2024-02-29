import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, IconButton, Icon } from '@edx/paragon';
import { Close, ThumbUpOutline, ThumbDownOffAlt } from '@edx/paragon/icons';

import './index.scss';
import messages from './messages';
import useFeedbackWidget from './useFeedbackWidget';

const FeedbackWidget = ({
  courseId,
  languageCode,
  unitId,
  userId,
}) => {
  const { formatMessage } = useIntl();
  const {
    closeFeedbackWidget,
    sendFeedback,
    showFeedbackWidget,
    showGratitudeText,
  } = useFeedbackWidget({
    courseId,
    languageCode,
    unitId,
    userId,
  });
  return (
    (showFeedbackWidget || showGratitudeText) && (
      <div className="sequence w-100">
        {
          showFeedbackWidget && (
            <div className="ml-4 mr-2">
              <ActionRow>
                {formatMessage(messages.rateTranslationText)}
                <ActionRow.Spacer />
                <div>
                  <IconButton
                    src={ThumbUpOutline}
                    iconAs={Icon}
                    alt="positive-feedback"
                    onClick={sendFeedback}
                    variant="secondary"
                    className="m-1"
                    id="positive-feedback-button"
                  />
                  <IconButton
                    src={ThumbDownOffAlt}
                    iconAs={Icon}
                    alt="negative-feedback"
                    onClick={sendFeedback}
                    variant="secondary"
                    className="mr-2"
                    id="negative-feedback-button"
                  />
                </div>
                <div className="mb-1 text-light action-row-divider">
                  |
                </div>
                <div>
                  <IconButton
                    src={Close}
                    iconAs={Icon}
                    alt="close-feedback"
                    onClick={closeFeedbackWidget}
                    variant="secondary"
                    className="ml-1 mr-2 float-right"
                    id="close-feedback-button"
                  />
                </div>
              </ActionRow>
            </div>
          )
        }
        {
          showGratitudeText && (
            <div className="ml-4 mr-4">
              <ActionRow className="m-2 justify-content-center">
                {formatMessage(messages.gratitudeText)}
              </ActionRow>
            </div>
          )
        }
      </div>
    )
  );
};

FeedbackWidget.propTypes = {
  courseId: PropTypes.string.isRequired,
  languageCode: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

FeedbackWidget.defaultProps = {};

export default FeedbackWidget;
