import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useWindowSize, breakpoints } from '@openedx/paragon';

const FlagButton = ({
  buttonIcon,
  title,
  text,
  handleSelect,
  isSelected,
}) => {
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;

  return (
    <button
      type="button"
      className={classnames(
        'flag-button row w-100 align-content-between m-1.5 py-3.5',
        isSelected ? 'flag-button-selected' : '',
      )}
      aria-checked={isSelected}
      role="radio"
      onClick={() => handleSelect()}
      data-testid={`weekly-learning-goal-input-${title}`}
    >
      <div className="row w-100 m-0 justify-content-center pb-1">
        {buttonIcon}
      </div>
      <div className={classnames(
        'row w-100 m-0 justify-content-center text-gray-700 pb-1',
        isSelected ? 'font-weight-bold' : '',
        { small: !wideScreen },
      )}
      >
        {title}
      </div>
      <div className={classnames(
        'row w-100 m-0 justify-content-center small text-gray-500',
        isSelected ? 'font-weight-bold' : '',
        { small: !wideScreen },
      )}
      >
        {text}
      </div>
    </button>
  );
};

FlagButton.propTypes = {
  buttonIcon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  handleSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default FlagButton;
