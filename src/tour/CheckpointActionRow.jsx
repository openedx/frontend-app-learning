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
          className="mr-2"
          onClick={onDismiss}
        >
          {dismissButtonText}
        </Button>
      )}
      <Button
        id="checkpoint-primary-button"
        autoFocus
        variant="primary"
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
  advanceButtonText: PropTypes.node,
  dismissButtonText: PropTypes.node,
  endButtonText: PropTypes.node,
  isLastCheckpoint: PropTypes.bool,
  onAdvance: PropTypes.func,
  onDismiss: PropTypes.func,
  onEnd: PropTypes.func,
};
