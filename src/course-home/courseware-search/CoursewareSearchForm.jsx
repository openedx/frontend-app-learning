import React from 'react';
import { SearchField } from '@edx/paragon';
import PropTypes from 'prop-types';

const CoursewareSearchForm = ({
  onSubmit,
  onChange,
  placeholder,
}) => (
  <SearchField.Advanced
    onSubmit={onSubmit}
    onChange={onChange}
    submitButtonLocation="external"
    className="courseware-search-form"
  >
    <div className="pgn__searchfield_wrapper" data-testid="courseware-search-form">
      <SearchField.Label />
      <SearchField.Input placeholder={placeholder} />
      <SearchField.ClearButton />
    </div>
    <SearchField.SubmitButton submitButtonLocation="external" />
  </SearchField.Advanced>
);

CoursewareSearchForm.propTypes = {
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

CoursewareSearchForm.defaultProps = {
  onSubmit: undefined,
  onChange: undefined,
  placeholder: undefined,
};

export default CoursewareSearchForm;
