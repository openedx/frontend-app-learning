import React, {
  useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, IconButton, Icon } from '@openedx/paragon';
import { Close, ThumbUpOutline, ThumbDownOffAlt } from '@openedx/paragon/icons';

import './index.scss';
import messages from './messages';
import useFeedbackWidget from './useFeedbackWidget';

const FeedbackWidget = ({
  courseId,
  translationLanguage,
  unitId,
  userId,
}) => {
  const { formatMessage } = useIntl();
  const ref = useRef(null);
  const [elemReady, setElemReady] = useState(false);
  const {
    closeFeedbackWidget,
    showFeedbackWidget,
    showGratitudeText,
    onThumbsUpClick,
    onThumbsDownClick,
  } = useFeedbackWidget({
    courseId,
    translationLanguage,
    unitId,
    userId,
  });

  useEffect(() => {
    if (ref.current) {
      const domNode = document.getElementById('whole-course-translation-feedback-widget');
      domNode.appendChild(ref.current);
      setElemReady(true);
    }
  }, [ref.current]);

  return (
    <div ref={ref} className={(elemReady && (showFeedbackWidget || showGratitudeText)) ? 'sequence-container d-inline-flex flex-row w-100' : 'd-none'}>
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
                    onClick={onThumbsUpClick}
                    variant="secondary"
                    className="m-1"
                    id="positive-feedback-button"
                  />
                  <IconButton
                    src={ThumbDownOffAlt}
                    iconAs={Icon}
                    alt="negative-feedback"
                    onClick={onThumbsDownClick}
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
    </div>
  );
};

FeedbackWidget.propTypes = {
  courseId: PropTypes.string.isRequired,
  translationLanguage: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

FeedbackWidget.defaultProps = {};

export default FeedbackWidget;
