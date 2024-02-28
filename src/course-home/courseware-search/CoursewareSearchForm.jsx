import React from 'react';
import PropTypes from 'prop-types';
import { SearchField } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

const CoursewareSearchForm = ({
  intl,
  searchTerm,
  onSubmit,
  onChange,
  placeholder,
}) => (
  <SearchField.Advanced
    value={searchTerm}
    onSubmit={onSubmit}
    onChange={onChange}
    submitButtonLocation="external"
    className="courseware-search-form"
    screenReaderText={{
      label: intl.formatMessage(messages.searchSubmitLabel),
      clearButton: intl.formatMessage(messages.searchClearAction),
      submitButton: null, // Remove the sr-only label in the button.
    }}
  >
    <div className="pgn__searchfield_wrapper" data-testid="courseware-search-form">
      <SearchField.Label />
      <SearchField.Input placeholder={placeholder} autoFocus />
      <SearchField.ClearButton />
    </div>
    <SearchField.SubmitButton
      buttonText={intl.formatMessage(messages.searchSubmitLabel)}
      submitButtonLocation="external"
      data-testid="courseware-search-form-submit"
    />
  </SearchField.Advanced>
);

CoursewareSearchForm.propTypes = {
  intl: intlShape.isRequired,
  searchTerm: PropTypes.string,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

CoursewareSearchForm.defaultProps = {
  searchTerm: undefined,
  onSubmit: undefined,
  onChange: undefined,
  placeholder: undefined,
};

export default injectIntl(CoursewareSearchForm);
