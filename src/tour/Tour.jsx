import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Checkpoint from './Checkpoint';

function Tour({
  tours,
}) {
  const tourValue = tours.filter((tour) => tour.enabled)[0];

  const [currentCheckpointData, setCurrentCheckpointData] = useState(null);
  const [index, setIndex] = useState(0);
  const [isTourEnabled, setIsTourEnabled] = useState(!!tourValue);
  const [prunedCheckpoints, setPrunedCheckpoints] = useState([]);

  /**
   * Takes a list of checkpoints and verifies that each target string provided is
   * an element in the DOM.
   */
  const pruneCheckpoints = (checkpoints) => {
    const checkpointsWithRenderedTargets = checkpoints.filter(
      (checkpoint) => !!document.querySelector(checkpoint.target),
    );
    setPrunedCheckpoints(checkpointsWithRenderedTargets);
  };

  useEffect(() => {
    if (tourValue) {
      if (!isTourEnabled) {
        setIsTourEnabled(tourValue.enabled);
      }
      pruneCheckpoints(tourValue.checkpoints);
      setIndex(tourValue.startingIndex || 0);
    }
  }, [tourValue]);

  useEffect(() => {
    if (isTourEnabled) {
      if (prunedCheckpoints) {
        setCurrentCheckpointData(prunedCheckpoints[index]);
      } else {
        pruneCheckpoints(tourValue.checkpoints);
      }
    }
  }, [index, isTourEnabled, prunedCheckpoints]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (isTourEnabled && event.keyCode === 27) {
        setIsTourEnabled(false);
        if (tourValue.onEscape) {
          tourValue.onEscape();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [currentCheckpointData]);

  if (!tourValue || !currentCheckpointData || !isTourEnabled) {
    return null;
  }

  const handleAdvance = () => {
    setIndex(index + 1);
    if (currentCheckpointData.onAdvance) {
      currentCheckpointData.onAdvance();
    }
  };

  const handleDismiss = () => {
    setIndex(0);
    setIsTourEnabled(false);
    if (currentCheckpointData.onDismiss) {
      currentCheckpointData.onDismiss();
    } else {
      tourValue.onDismiss();
    }
    setCurrentCheckpointData(null);
  };

  const handleEnd = () => {
    setIndex(0);
    setIsTourEnabled(false);
    if (tourValue.onEnd) {
      tourValue.onEnd();
    }
    setCurrentCheckpointData(null);
  };

  return (
    <Checkpoint
      advanceButtonText={currentCheckpointData.advanceButtonText || tourValue.advanceButtonText}
      body={currentCheckpointData.body}
      currentCheckpointData={currentCheckpointData}
      dismissButtonText={currentCheckpointData.dismissButtonText || tourValue.dismissButtonText}
      endButtonText={currentCheckpointData.endButtonText || tourValue.endButtonText}
      index={index}
      onAdvance={handleAdvance}
      onDismiss={handleDismiss}
      onEnd={handleEnd}
      placement={currentCheckpointData.placement}
      target={currentCheckpointData.target}
      title={currentCheckpointData.title}
      totalCheckpoints={prunedCheckpoints.length}
    />
  );
}

Tour.defaultProps = {
  tours: {
    advanceButtonText: '',
    checkpoints: {
      advanceButtonText: '',
      body: '',
      dismissButtonText: '',
      endButtonText: '',
      onAdvance: () => {},
      onDismiss: () => {},
      placement: 'top',
      title: '',
    },
    dismissButtonText: '',
    endButtonText: '',
    onDismiss: () => {},
    onEnd: () => {},
    onEscape: () => {},
    startingIndex: 0,
  },
};

Tour.propTypes = {
  tours: PropTypes.arrayOf(PropTypes.shape({
    advanceButtonText: PropTypes.node,
    checkpoints: PropTypes.arrayOf(PropTypes.shape({
      advanceButtonText: PropTypes.node,
      body: PropTypes.node,
      dismissButtonText: PropTypes.node,
      endButtonText: PropTypes.node,
      onAdvance: PropTypes.func,
      onDismiss: PropTypes.func,
      placement: PropTypes.oneOf([
        'top', 'top-start', 'top-end', 'right-start', 'right', 'right-end',
        'left-start', 'left', 'left-end', 'bottom', 'bottom-start', 'bottom-end',
      ]),
      target: PropTypes.string.isRequired,
      title: PropTypes.node,
    })),
    dismissButtonText: PropTypes.node,
    enabled: PropTypes.bool.isRequired,
    endButtonText: PropTypes.node,
    onDismiss: PropTypes.func,
    onEnd: PropTypes.func,
    onEscape: PropTypes.func,
    startingIndex: PropTypes.number,
    tourId: PropTypes.string.isRequired,
  })),
};

export default Tour;
