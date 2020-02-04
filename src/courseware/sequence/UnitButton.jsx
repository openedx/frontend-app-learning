import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from '@edx/paragon';

import UnitIcon from './UnitIcon';
import CompleteIcon from './CompleteIcon';

export default function UnitButton({
  clickHandler,
  pageTitle,
  type,
  isActive,
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
    </Button>
  );
}

UnitButton.propTypes = {
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool,
  isComplete: PropTypes.bool,
  clickHandler: PropTypes.func.isRequired,
  pageTitle: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

UnitButton.defaultProps = {
  isActive: false,
  isComplete: false,
};
