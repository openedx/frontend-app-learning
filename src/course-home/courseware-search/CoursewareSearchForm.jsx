import PropTypes from 'prop-types';
import { SearchField } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const CoursewareSearchForm = ({
  searchTerm,
  onSubmit,
  onChange,
  placeholder,
  labelledBy,
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
        submitButton: null, // Remove the sr-only label in the button.
      }}
    >
      <div className="pgn__searchfield_wrapper" data-testid="courseware-search-form">
        {/* The visible "Search this course" heading is the accessible label via aria-labelledby. */}
        <SearchField.Input placeholder={placeholder} aria-labelledby={labelledBy} autoFocus />
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
  labelledBy: PropTypes.string,
};

CoursewareSearchForm.defaultProps = {
  searchTerm: undefined,
  onSubmit: undefined,
  onChange: undefined,
  placeholder: undefined,
  labelledBy: undefined,
};

export default CoursewareSearchForm;
