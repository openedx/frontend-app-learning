import React from 'react';
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
      disabled={isActive}
      onClick={onClick}
      title={pageTitle}
    >
      <UnitIcon type={type} />
      {isComplete ? <CompleteIcon className="text-success ml-2" /> : null}
    </Button>
  );
}
