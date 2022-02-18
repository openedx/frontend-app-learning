import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery } from '@edx/paragon';
import { createPopper } from '@popperjs/core';

import CheckpointActionRow from './CheckpointActionRow';
import CheckpointBody from './CheckpointBody';
import CheckpointBreadcrumbs from './CheckpointBreadcrumbs';
import CheckpointTitle from './CheckpointTitle';

function Checkpoint({
  body,
  index,
  placement,
  target,
  title,
  totalCheckpoints,
  ...props
}) {
  const [checkpointVisible, setCheckpointVisible] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    const targetElement = document.querySelector(target);
    const checkpoint = document.querySelector('#checkpoint');
    if (targetElement && checkpoint) {
      // Translate the Checkpoint to its target's coordinates
      const checkpointPopper = createPopper(targetElement, checkpoint, {
        placement: isMobile ? 'top' : placement,
        modifiers: [
          {
            name: 'arrow',
            options: {
              padding: 25,
            },
          },
          {
            name: 'offset',
            options: {
              offset: [0, 20],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 20,
              tetherOffset: 35,
            },
          },
        ],
      });
      setCheckpointVisible(true);
      if (checkpointPopper) {
        checkpointPopper.forceUpdate();
      }
    }
  }, [target, isMobile]);

  useEffect(() => {
    if (checkpointVisible) {
      const targetElement = document.querySelector(target);
      let targetOffset = targetElement.getBoundingClientRect().top;
      if ((targetOffset < 0) || (targetElement.getBoundingClientRect().bottom > window.innerHeight)) {
        if (placement.includes('top')) {
          if (targetOffset < 0) {
            targetOffset *= -1;
          }
          targetOffset -= 280;
        } else {
          targetOffset -= 80;
        }

        window.scrollTo({
          top: targetOffset, behavior: 'smooth',
        });
      }

      const button = document.querySelector('#checkpoint-primary-button');
      button.focus();
    }
  }, [target, checkpointVisible]);
  const isLastCheckpoint = index + 1 === totalCheckpoints;
  const isOnlyCheckpoint = totalCheckpoints === 1;
  return (
    <div
      id="checkpoint"
      className="checkpoint-popover p-4 bg-light-300"
      aria-labelledby="checkpoint-title"
      role="dialog"
      style={{ visibility: checkpointVisible ? 'visible' : 'hidden', pointerEvents: checkpointVisible ? 'auto' : 'none' }}
    >
      {/* This text is not translated due to Paragon's lack of i18n support */}
      <span className="sr-only">Top of step {index + 1}</span>
      {(title || !isOnlyCheckpoint) && (
        <div className="d-flex justify-content-between mb-2.5">
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
  placement: 'top',
  title: null,
};

Checkpoint.propTypes = {
  advanceButtonText: PropTypes.node,
  body: PropTypes.node,
  dismissButtonText: PropTypes.node,
  endButtonText: PropTypes.node,
  index: PropTypes.number.isRequired,
  onAdvance: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
  placement: PropTypes.oneOf([
    'top', 'top-start', 'top-end', 'right-start', 'right', 'right-end',
    'left-start', 'left', 'left-end', 'bottom', 'bottom-start', 'bottom-end',
  ]),
  target: PropTypes.string.isRequired,
  title: PropTypes.node,
  totalCheckpoints: PropTypes.number.isRequired,
};

export default Checkpoint;
