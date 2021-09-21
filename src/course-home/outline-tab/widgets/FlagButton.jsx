import React, { useState } from 'react';
import classNames from 'classnames';

import PropTypes from 'prop-types';

function FlagButton({
  icon,
  srText,
  title,
  text,
  isEnabled,
  handleSelect,
}) {
  const [isHighlight, setHighlight] = useState(false);

  return (
    <button
      type="button"
      className={classNames('col flex-grow-1 p-3 border border-light rounded bg-white', { 'border-dark': isEnabled || isHighlight })}
      onMouseEnter={() => setHighlight(true)}
      onMouseLeave={() => setHighlight(false)}
      onClick={() => handleSelect()}
    >
      <div className=" justify-content-center">
        {icon}
      </div>
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
  icon: PropTypes.node.isRequired,
  srText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  isEnabled: PropTypes.bool,
  handleSelect: PropTypes.func.isRequired,
};
FlagButton.defaultProps = {
  isEnabled: false,
  text: '',
};

export default FlagButton;
