import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import messages from '../messages';

function FlagButton({
  buttonIcon,
  title,
  text,
  handleSelect,
  intl,
}) {
  return (
    <button
      type="button"
      className={classNames('flag-button col flex-grow-1 p-3')}
      onClick={() => handleSelect()}
    >
      {buttonIcon}
      <span className="sr-only sr-only-focusable">{intl.formatMessage(messages.setLearningGoalButtonScreenReaderText)}</span>
      <div className="text-center small text-gray-700">
        {title}
      </div>
      <div className="text-center micro text-gray-500">
        {text}
      </div>
    </button>
  );
}

FlagButton.propTypes = {
  buttonIcon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  handleSelect: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(FlagButton);
