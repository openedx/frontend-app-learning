import React from 'react';
import classNames from 'classnames';

import PropTypes from 'prop-types';

function FlagButton({
  buttonIcon,
  srText,
  title,
  text,
  handleSelect,
}) {
  return (
    <button
      type="button"
      className={classNames('flag-button col flex-grow-1 p-3')}
      onClick={() => handleSelect()}
    >
      {buttonIcon}
      <span className="sr-only sr-only-focusable">{srText}</span>
      <div className="text-center small">
        {title}
      </div>
      <div className="text-center micro">
        {text}
      </div>
    </button>
  );
}

FlagButton.propTypes = {
  buttonIcon: PropTypes.element.isRequired,
  srText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  handleSelect: PropTypes.func.isRequired,
};

export default FlagButton;
