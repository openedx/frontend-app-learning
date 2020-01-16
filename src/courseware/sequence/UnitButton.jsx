import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from '@edx/paragon';

import UnitIcon from './UnitIcon';
import CompleteIcon from './CompleteIcon';

export default function UnitButton({
  onClick,
  pageTitle,
  type,
  isActive,
  isComplete,
}) {
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
  isActive: PropTypes.bool.isRequired,
  isComplete: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  pageTitle: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};
