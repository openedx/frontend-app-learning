import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

export default function CheckpointActionRow({
  advanceButtonText,
  dismissButtonText,
  endButtonText,
  isLastCheckpoint,
  onAdvance,
  onDismiss,
  onEnd,
}) {
  return (
    <div className="d-flex justify-content-end">
      {!isLastCheckpoint && (
        <Button
          variant="tertiary"
          size="sm"
          className="mr-2"
          onClick={onDismiss}
        >
          {dismissButtonText}
        </Button>
      )}
      <Button
        autoFocus
        variant="primary"
        size="sm"
        onClick={isLastCheckpoint ? onEnd : onAdvance}
      >
        {isLastCheckpoint ? endButtonText : advanceButtonText}
      </Button>
    </div>
  );
}

CheckpointActionRow.defaultProps = {
  advanceButtonText: '',
  dismissButtonText: '',
  endButtonText: '',
  isLastCheckpoint: false,
  onAdvance: () => {},
  onDismiss: () => {},
  onEnd: () => {},
};

CheckpointActionRow.propTypes = {
  advanceButtonText: PropTypes.string,
  dismissButtonText: PropTypes.string,
  endButtonText: PropTypes.string,
  isLastCheckpoint: PropTypes.bool,
  onAdvance: PropTypes.func,
  onDismiss: PropTypes.func,
  onEnd: PropTypes.func,
};
