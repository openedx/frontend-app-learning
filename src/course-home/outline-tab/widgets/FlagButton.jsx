import React, { useState } from 'react';

import PropTypes from 'prop-types';

function FlagButton({
  icon,
  title,
  text,
  isEnabled,
  handleSelect,
}) {
  const baseOutlineStyle = 'col flex-grow-1 p-3 border border-light rounded bg-white';
  const selectedOutlineStyle = 'col flex-grow-1 p-3 border border-dark rounded bg-white';
  const [isHighlight, setHighlight] = useState(false);

  function getOutlineStyle() {
    return isEnabled || isHighlight ? selectedOutlineStyle : baseOutlineStyle;
  }

  return (
    <button
      type="button"
      className={getOutlineStyle()}
      onMouseEnter={() => setHighlight(true)}
      onMouseLeave={() => setHighlight(false)}
      onClick={() => handleSelect()}
    >
      <div className=" justify-content-center">
        {icon}
      </div>
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
