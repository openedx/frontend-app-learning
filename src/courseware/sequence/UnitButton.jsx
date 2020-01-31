import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from '@edx/paragon';

import UnitIcon from './UnitIcon';
import CompleteIcon from './CompleteIcon';
import BookmarkFilledIcon from './bookmark/BookmarkFilledIcon';

export default function UnitButton({
  clickHandler,
  pageTitle,
  type,
  isActive,
  isBookmarked,
  isComplete,
  index,
}) {
  const onClick = useCallback(() => {
    clickHandler(index);
  });

  return (
    <Button
      className={classNames({
        active: isActive,
        'btn-outline-primary': !isActive,
        'btn-outline-secondary': isActive,
      })}

      onClick={onClick}
      title={pageTitle}
    >
      <UnitIcon type={type} />
      {isComplete ? <CompleteIcon className="text-success ml-2" /> : null}
      {isBookmarked ? (
        <BookmarkFilledIcon
          className="text-primary small position-absolute"
          style={{ top: '-3px', right: '5px' }}
        />
      ) : null}
    </Button>
  );
}

UnitButton.propTypes = {
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool,
  isBookmarked: PropTypes.bool,
  isComplete: PropTypes.bool,
  clickHandler: PropTypes.func.isRequired,
  pageTitle: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

UnitButton.defaultProps = {
  isActive: false,
  isBookmarked: false,
  isComplete: false,
};
