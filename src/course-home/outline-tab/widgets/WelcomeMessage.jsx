import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Button, TransitionReplace } from '@edx/paragon';
import truncate from 'truncate-html';

import { useDispatch } from 'react-redux';
import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';
import { dismissWelcomeMessage } from '../../data/thunks';

function WelcomeMessage({ courseId, intl }) {
  const {
    welcomeMessageHtml,
  } = useModel('outline', courseId);

  if (!welcomeMessageHtml) {
    return null;
  }

  const [display, setDisplay] = useState(true);

  const shortWelcomeMessageHtml = truncate(welcomeMessageHtml, 100, { byWords: true, keepWhitespaces: true });
  const messageCanBeShortened = shortWelcomeMessageHtml.length < welcomeMessageHtml.length;
  const [showShortMessage, setShowShortMessage] = useState(messageCanBeShortened);
  const dispatch = useDispatch();
  return (
    <Alert
      data-testid="alert-container-welcome"
      variant="light"
      stacked
      dismissible
      show={display}
      onClose={() => {
        setDisplay(false);
        dispatch(dismissWelcomeMessage(courseId));
      }}
      className="raised-card"
      actions={messageCanBeShortened ? [
        <Button
          onClick={() => setShowShortMessage(!showShortMessage)}
          variant="outline-primary"
        >
          {showShortMessage ? intl.formatMessage(messages.welcomeMessageShowMoreButton)
            : intl.formatMessage(messages.welcomeMessageShowLessButton)}
        </Button>,
      ] : []}
    >
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
            html={welcomeMessageHtml}
            title={intl.formatMessage(messages.welcomeMessage)}
          />
        )}
      </TransitionReplace>
    </Alert>
  );
}

WelcomeMessage.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(WelcomeMessage);
