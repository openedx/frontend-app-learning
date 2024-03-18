import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  StandardModal,
  ActionRow,
  Button,
  Icon,
  ListBox,
  ListBoxOption,
} from '@edx/paragon';
import { Check } from '@edx/paragon/icons';

import useTranslationModal from './useTranslationModal';
import messages from './messages';

import './TranslationModal.scss';

const TranslationModal = ({
  isOpen,
  close,
  selectedLanguage,
  setSelectedLanguage,
  availableLanguages,
}) => {
  const { formatMessage } = useIntl();
  const { selectedIndex, setSelectedIndex, onSubmit } = useTranslationModal({
    selectedLanguage,
    setSelectedLanguage,
    close,
    availableLanguages,
  });

  return (
    <StandardModal
      title={formatMessage(messages.languageSelectionModalTitle)}
      isOpen={isOpen}
      onClose={close}
      footerNode={(
        <ActionRow>
          <ActionRow.Spacer />
          <Button variant="tertiary" onClick={close}>
            {formatMessage(messages.cancelButtonText)}
          </Button>
          <Button onClick={onSubmit}>
            {formatMessage(messages.submitButtonText)}
          </Button>
        </ActionRow>
      )}
    >
      <ListBox className="listbox-container">
        {availableLanguages.map(({ code, label }, index) => (
          <ListBoxOption
            className="d-flex justify-content-between"
            key={code}
            selectedOptionIndex={selectedIndex}
            onSelect={() => setSelectedIndex(index)}
          >
            {label}
            {selectedIndex === index && <Icon src={Check} />}
          </ListBoxOption>
        ))}
      </ListBox>
    </StandardModal>
  );
};

TranslationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  setSelectedLanguage: PropTypes.func.isRequired,
  availableLanguages: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default TranslationModal;
