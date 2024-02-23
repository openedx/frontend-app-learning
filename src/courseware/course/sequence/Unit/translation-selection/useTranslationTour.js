import { useCallback } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@edx/paragon';
import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';

import messages from './messages';

const hasSeenTranslationTourKey = 'hasSeenTranslationTour';

export const stateKeys = StrictDict({
  showTranslationTour: 'showTranslationTour',
});

const useTranslationTour = () => {
  const { formatMessage } = useIntl();

  const [isTourEnabled, setIsTourEnabled] = useKeyedState(
    stateKeys.showTranslationTour,
    global.localStorage.getItem(hasSeenTranslationTourKey) !== 'true',
  );
  const [isOpen, open, close] = useToggle(false);

  const endTour = useCallback(() => {
    global.localStorage.setItem(hasSeenTranslationTourKey, 'true');
    setIsTourEnabled(false);
  }, [isTourEnabled, setIsTourEnabled]);

  const tryIt = useCallback(() => {
    endTour();
    open();
  }, [endTour, open]);

  const translationTour = isTourEnabled
    ? {
      tourId: 'translation',
      enabled: isTourEnabled,
      onDismiss: endTour,
      onEnd: tryIt,
      checkpoints: [
        {
          title: formatMessage(messages.translationTourModalTitle),
          body: formatMessage(messages.translationTourModalBody),
          placement: 'bottom',
          target: '#translation-selection-button',
          showDismissButton: true,
          endButtonText: formatMessage(messages.tryItButtonText),
          dismissButtonText: formatMessage(messages.dismissButtonText),
        },
      ],
    }
    : {};

  return {
    translationTour,
    isOpen,
    open,
    close,
  };
};

export default useTranslationTour;
