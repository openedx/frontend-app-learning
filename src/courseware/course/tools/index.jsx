import React, { Component } from 'react';
import PropTypes from 'prop-types';

import NotesVisibility from './notes';

export default class ContentTools extends Component {
  constructor(props) {
    super(props);
    this.course = props.course;
  }

  render() {
    return (
      <div className="container fixed-bottom py-4">
        <div className="d-flex justify-content-end">
          {this.course.notes.enabled && (
            <NotesVisibility course={this.course} />
          )}
          {this.course.showCalculator && (
            <Calculator />
          )}
        </div>
      </div>
    );
  }
}

ContentTools.propTypes = {
  course: PropTypes.shape({
    notes: {
      enabled: PropTypes.boolean,
    },
  }).isRequired,
};
