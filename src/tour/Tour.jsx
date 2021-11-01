import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery } from 'react-responsive';
import { createPopper } from '@popperjs/core';

import Checkpoint from './Checkpoint';

function Tour({
  tours,
}) {
  const tourValue = tours.filter((tour) => tour.enabled)[0];
  const [index, setIndex] = useState(0);
  const [checkpointData, setCheckpointData] = useState(null);
  const [isEnabled, setIsEnabled] = useState(tourValue && tourValue.enabled);
  const [hideCheckpoint, setHideCheckpoint] = useState(false);

  useEffect(() => {
    if (tourValue) {
      setCheckpointData(tourValue.checkpoints[index]);
      setIndex(tourValue.startingIndex || 0);
    }
  }, []);

  useEffect(() => {
    setIsEnabled(tourValue && tourValue.enabled);
  }, [tourValue]);

  useEffect(() => {
    if (tourValue) {
      setCheckpointData(tourValue.checkpoints[index]);
    }
  }, [index, isEnabled]);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    if (checkpointData && isEnabled) {
      const targetElement = document.querySelector(checkpointData.target);
      const checkpoint = document.querySelector('#checkpoint');
      if (!targetElement) {
        setHideCheckpoint(true);
      } else {
        setHideCheckpoint(false);
        createPopper(targetElement, checkpoint, {
          placement: isMobile ? 'top' : checkpointData.placement,
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
            {
              name: 'arrow',
              options: {
                padding: 5,
              },
            },
          ],
        });

        let targetOffset = targetElement.getBoundingClientRect().top;
        if (checkpointData.placement && checkpointData.placement.includes('top')) {
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
    }
  }, [checkpointData, index, isMobile]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (isEnabled && event.keyCode === 27) {
        setIsEnabled(false);
        if (tourValue.onEnd) {
          tourValue.onEnd();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [tourValue]);

  if (!tourValue || !checkpointData || !isEnabled) {
    return null;
  }

  const handleAdvance = () => {
    setIndex(index + 1);
    if (checkpointData.onAdvance) {
      checkpointData.onAdvance();
    }
  };

  const handleDismiss = () => {
    setIndex(0);
    setIsEnabled(false);
    if (checkpointData.onDismiss) {
      checkpointData.onDismiss();
    } else {
      tourValue.onDismiss();
    }
  };

  const handleEnd = () => {
    setIndex(0);
    setIsEnabled(false);
    if (tourValue.onEnd) {
      tourValue.onEnd();
    }
  };

  return (
    <Checkpoint
      advanceButtonText={checkpointData.advanceButtonText || tourValue.advanceButtonText}
      body={checkpointData.body}
      dismissButtonText={checkpointData.dismissButtonText || tourValue.dismissButtonText}
      endButtonText={checkpointData.endButtonText || tourValue.endButtonText}
      hideCheckpoint={hideCheckpoint}
      index={index}
      onAdvance={handleAdvance}
      onDismiss={handleDismiss}
      onEnd={handleEnd}
      title={checkpointData.title}
      totalCheckpoints={tourValue.checkpoints.length}
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
    startingIndex: 0,
  },
};

Tour.propTypes = {
  tours: PropTypes.arrayOf(PropTypes.shape({
    advanceButtonText: PropTypes.node,
    checkpoints: PropTypes.arrayOf(PropTypes.shape({
      advanceButtonText: PropTypes.string,
      body: PropTypes.string,
      dismissButtonText: PropTypes.string,
      endButtonText: PropTypes.string,
      onAdvance: PropTypes.func,
      onDismiss: PropTypes.func,
      placement: PropTypes.oneOf([
        'top', 'top-start', 'top-end', 'right-start', 'right', 'right-end',
        'left-start', 'left', 'left-end', 'bottom', 'bottom-start', 'bottom-end',
      ]),
      target: PropTypes.string.isRequired,
      title: PropTypes.string,
    })),
    dismissButtonText: PropTypes.node,
    enabled: PropTypes.bool.isRequired,
    endButtonText: PropTypes.node,
    onDismiss: PropTypes.func,
    onEnd: PropTypes.func,
    startingIndex: PropTypes.number,
    tourId: PropTypes.string.isRequired,
  })),
};

export default Tour;
