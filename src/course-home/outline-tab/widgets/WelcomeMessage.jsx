import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

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
      >
        <div className="my-3">
          <LmsHtmlFragment
            html={showShortMessage ? shortWelcomeMessageHtml : welcomeMessageHtml}
            title={intl.formatMessage(messages.welcomeMessage)}
          />
        </div>
        {
          shortWelcomeMessageHtml && (
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn rounded align-self-center border border-primary bg-white font-weight-bold mb-3"
                onClick={() => setShowShortMessage(!showShortMessage)}
              >
                {showShortMessage ? intl.formatMessage(messages.welcomeMessageShowMoreButton)
                  : intl.formatMessage(messages.welcomeMessageShowLessButton)}
              </button>
            </div>
          )
        }
      </Alert>
    )
  );
}

WelcomeMessage.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(WelcomeMessage);
