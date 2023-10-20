import React from 'react';
import { SearchField } from '@edx/paragon';
import PropTypes from 'prop-types';

const CoursewareSearchBar = ({
  onSubmit,
  onChange,
  placeholder,
}) => (
  <SearchField.Advanced
    onSubmit={onSubmit}
    onChange={onChange}
    submitButtonLocation="external"
    className="courseware-search-bar"
    data-testid="courseware-search-bar"
  >
    <div className="pgn__searchfield_wrapper">
      <SearchField.Label />
      <SearchField.Input placeholder={placeholder} />
      <SearchField.ClearButton />
    </div>
    <SearchField.SubmitButton submitButtonLocation="external" />
  </SearchField.Advanced>
);

CoursewareSearchBar.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
};

export default CoursewareSearchBar;
