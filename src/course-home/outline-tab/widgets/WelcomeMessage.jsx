import React, {
  useState, useRef, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';

import { Alert, Button, TransitionReplace } from '@openedx/paragon';
import truncate from 'truncate-html';

import { useDispatch } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';
import { dismissWelcomeMessage } from '../../data/thunks';

const WelcomeMessage = ({ courseId, nextElementRef }) => {
  const intl = useIntl();
  const {
    welcomeMessageHtml,
  } = useModel('outline', courseId);

  const messageBodyRef = useRef();
  const [display, setDisplay] = useState(true);

  // welcomeMessageHtml can contain comments or malformatted HTML which can impact the length that determines
  // messageCanBeShortened. We clean it by calling truncate with a length of welcomeMessageHtml.length which
  // will not result in a truncation but a formatting into 'truncate-html' canonical format.
  const cleanedWelcomeMessageHtml = useMemo(
    () => truncate(welcomeMessageHtml, welcomeMessageHtml.length, { keepWhitespaces: true }),
    [welcomeMessageHtml],
  );
  const shortWelcomeMessageHtml = useMemo(
    () => truncate(cleanedWelcomeMessageHtml, 100, { byWords: true, keepWhitespaces: true }),
    [cleanedWelcomeMessageHtml],
  );
  const messageCanBeShortened = useMemo(
    () => (shortWelcomeMessageHtml.length < cleanedWelcomeMessageHtml.length),
    [cleanedWelcomeMessageHtml, shortWelcomeMessageHtml],
  );

  const [showShortMessage, setShowShortMessage] = useState(messageCanBeShortened);
  const dispatch = useDispatch();
  const alertRef = useRef(null);

  if (!welcomeMessageHtml) {
    return null;
  }

  useEffect(() => {
    // TODO: Temporary solution due to a bug in the Paragon Alert component
    // that prevents changing the button sizes. Delete after correction.
    // Issue: https://github.com/openedx/paragon/issues/3205
    if (alertRef.current) {
      const buttons = alertRef.current.querySelectorAll('button.btn-sm');
      buttons.forEach(btn => btn.classList.remove('btn-sm'));
    }
  }, [showShortMessage]);

  return (
    <Alert
      data-testid="alert-container-welcome"
      variant="light"
      stacked
      ref={alertRef}
      dismissible
      show={display}
      onClose={() => {
        nextElementRef.current?.focus();
        setDisplay(false);
        dispatch(dismissWelcomeMessage(courseId));
      }}
      className="raised-card"
      actions={messageCanBeShortened ? [
        <Button
          onClick={() => {
            if (showShortMessage) {
              messageBodyRef.current?.focus();
            }

            setShowShortMessage(!showShortMessage);
          }}
          variant="outline-primary"
        >
          {showShortMessage ? intl.formatMessage(messages.welcomeMessageShowMoreButton)
            : intl.formatMessage(messages.welcomeMessageShowLessButton)}
        </Button>,
      ] : []}
    >
      <div ref={messageBodyRef} tabIndex="-1">
        <TransitionReplace className="mb-3" enterDuration={400} exitDuration={200}>
          {showShortMessage ? (
            <LmsHtmlFragment
              className="inline-link"
              data-testid="short-welcome-message-iframe"
              key="short-html"
              html={shortWelcomeMessageHtml}
              title={intl.formatMessage(messages.welcomeMessage)}
            />
          ) : (
            <LmsHtmlFragment
              className="inline-link"
              data-testid="long-welcome-message-iframe"
              key="full-html"
              html={cleanedWelcomeMessageHtml}
              title={intl.formatMessage(messages.welcomeMessage)}
            />
          )}
        </TransitionReplace>
      </div>
    </Alert>
  );
};

WelcomeMessage.propTypes = {
  courseId: PropTypes.string.isRequired,
  nextElementRef: PropTypes.shape({ current: PropTypes.instanceOf(HTMLInputElement) }),
};

export default WelcomeMessage;
