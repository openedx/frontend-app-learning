import React from 'react';
import PropTypes from 'prop-types';

import CheckpointActionRow from './CheckpointActionRow';
import CheckpointBody from './CheckpointBody';
import CheckpointBreadcrumbs from './CheckpointBreadcrumbs';
import CheckpointTitle from './CheckpointTitle';

function Checkpoint({
  body,
  hideCheckpoint,
  index,
  title,
  totalCheckpoints,
  ...props
}) {
  const isLastCheckpoint = index + 1 === totalCheckpoints;
  const isOnlyCheckpoint = totalCheckpoints === 1;
  return (
    <div
      id="checkpoint"
      className="checkpoint-popover p-4 bg-light-300"
      aria-labelledby="checkpoint-title"
      role="dialog"
      style={{ display: hideCheckpoint ? 'none' : 'block' }}
    >
      {/* This text is not translated due to Paragon's lack of i18n support */}
      <span className="sr-only">Top of step {index + 1}</span>
      {(title || !isOnlyCheckpoint) && (
        <div className="d-flex justify-content-between mb-2.5" style={{ overflowX: 'scroll' }}>
          <CheckpointTitle>{title}</CheckpointTitle>
          <CheckpointBreadcrumbs currentIndex={index} totalCheckpoints={totalCheckpoints} />
        </div>
      )}
      <CheckpointBody>{body}</CheckpointBody>
      <CheckpointActionRow
        isLastCheckpoint={isLastCheckpoint}
        {...props}
      />
      <div id="checkpoint-arrow" data-popper-arrow />
      {/* This text is not translated due to Paragon's lack of i18n support */}
      <span className="sr-only">Bottom of step {index + 1}</span>
    </div>
  );
}

Checkpoint.defaultProps = {
  advanceButtonText: null,
  body: null,
  dismissButtonText: null,
  endButtonText: null,
  title: null,
};

Checkpoint.propTypes = {
  advanceButtonText: PropTypes.string,
  body: PropTypes.string,
  dismissButtonText: PropTypes.string,
  endButtonText: PropTypes.string,
  hideCheckpoint: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  onAdvance: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
  title: PropTypes.string,
  totalCheckpoints: PropTypes.number.isRequired,
};

export default Checkpoint;
