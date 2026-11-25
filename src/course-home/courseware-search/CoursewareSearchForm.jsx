import PropTypes from 'prop-types';
import { SearchField } from '@openedx/paragon';
import { useIntl } from '@openedx/frontend-base';
import messages from './messages';

const CoursewareSearchForm = ({
  searchTerm,
  onSubmit,
  onChange,
  placeholder,
}) => {
  const { formatMessage } = useIntl();

  return (
    <SearchField.Advanced
      value={searchTerm}
      onSubmit={onSubmit}
      onChange={onChange}
      submitButtonLocation="external"
      className="courseware-search-form"
      screenReaderText={{
        label: formatMessage(messages.searchSubmitLabel),
        clearButton: formatMessage(messages.searchClearAction),
        submitButton: '', // No sr-only label in the button: its visible text names it. Paragon requires the key.
      }}
    >
      <div className="pgn__searchfield_wrapper" data-testid="courseware-search-form">
        <SearchField.Label />
        <SearchField.Input placeholder={placeholder} autoFocus />
        <SearchField.ClearButton />
      </div>
      <SearchField.SubmitButton
        buttonText={formatMessage(messages.searchSubmitLabel)}
        submitButtonLocation="external"
        data-testid="courseware-search-form-submit"
      />
    </SearchField.Advanced>
  );
};

CoursewareSearchForm.propTypes = {
  searchTerm: PropTypes.string,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default CoursewareSearchForm;
