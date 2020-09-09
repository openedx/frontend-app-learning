import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, TransitionReplace } from '@edx/paragon';

import { useDispatch } from 'react-redux';
import LmsHtmlFragment from '../LmsHtmlFragment';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';
import { Alert } from '../../../generic/user-messages';
import { dismissWelcomeMessage } from '../../data/thunks';

function WelcomeMessage({ courseId, intl }) {
  const {
    welcomeMessageHtml,
  } = useModel('outline', courseId);

  if (!welcomeMessageHtml) {
    return null;
  }

  const [display, setDisplay] = useState(true);

  const shortWelcomeMessageHtml = welcomeMessageHtml.length > 200 && `${welcomeMessageHtml.substring(0, 199)}...`;
  const [showShortMessage, setShowShortMessage] = useState(!!shortWelcomeMessageHtml);
  const dispatch = useDispatch();

  return (
    display && (
      <Alert
        type="welcome"
        dismissible
        onDismiss={() => {
          setDisplay(false);
          dispatch(dismissWelcomeMessage(courseId));
        }}
        footer={shortWelcomeMessageHtml && (
          <div className="row w-100 m-0">
            <div className="col-12 col-sm-auto p-0">
              <Button
                block
                onClick={() => setShowShortMessage(!showShortMessage)}
                variant="outline-primary"
              >
                {showShortMessage ? intl.formatMessage(messages.welcomeMessageShowMoreButton)
                  : intl.formatMessage(messages.welcomeMessageShowLessButton)}
              </Button>
            </div>
          </div>
        )}
      >
        <TransitionReplace className="mb-3" enterDuration={200} exitDuration={200}>
          {showShortMessage ? (
            <LmsHtmlFragment
              key="short-html"
              html={shortWelcomeMessageHtml}
              title={intl.formatMessage(messages.welcomeMessage)}
            />
          ) : (
            <LmsHtmlFragment
              key="full-html"
              html={welcomeMessageHtml}
              title={intl.formatMessage(messages.welcomeMessage)}
            />
          )}
        </TransitionReplace>
      </Alert>
    )
  );
}

WelcomeMessage.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(WelcomeMessage);
