import React from 'react';
import PropTypes from 'prop-types';

function FlagButton({
  buttonIcon,
  title,
  text,
}) {
  return (
    <div
      className="flag-button col flex-grow-1 p-3"
    >
      <div className="row justify-content-center">
        {buttonIcon}
      </div>
      <div className="text-center small text-gray-700">
        {title}
      </div>
      <div className="text-center micro text-gray-500">
        {text}
      </div>
    </div>
  );
}

FlagButton.propTypes = {
  buttonIcon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default FlagButton;
