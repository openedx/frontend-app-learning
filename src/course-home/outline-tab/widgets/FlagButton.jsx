import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

function FlagButton({
  buttonIcon,
  title,
  text,
  handleSelect,
  isSelected,
}) {
  return (
    <button
      type="button"
      className={classnames('flag-button m-1.5 pt-3 pb-md-3 pb-xl-0',
        isSelected ? 'flag-button-selected' : '')}
      // aria-checked={isSelected}
      // role="radio"
      // tabIndex={isSelected ? '0' : '-1'}
      onClick={() => handleSelect()}
      data-testid={`weekly-learning-goal-input-${title}`}
    >
      <div className="row justify-content-center pb-1 w-100 m-0">
        {buttonIcon}
      </div>
      <div className={classnames('text-center small text-gray-700 pb-1', isSelected ? 'font-weight-bold' : '')}>
        {title}
      </div>
      <div className={classnames('text-center micro text-gray-500 pb-2', isSelected ? 'font-weight-bold' : '')}>
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
  isSelected: PropTypes.bool.isRequired,
};

export default FlagButton;
