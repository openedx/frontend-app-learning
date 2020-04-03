import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Calculator from './calculator';
import NotesVisibility from './notes';
import './tools.scss';


export default class ContentTools extends Component {
  constructor(props) {
    super(props);
    this.course = props.course;
  }

  render() {
    return (
      <div className="content-tools">
        <div className="d-flex justify-content-end m-0">
          {this.course.showCalculator && (
            <Calculator />
          )}
          {this.course.notes.enabled && (
            <NotesVisibility course={this.course} />
          )}
        </div>
      </div>
    );
  }
}

ContentTools.propTypes = {
  course: PropTypes.shape({
    notes: PropTypes.shape({
      enabled: PropTypes.bool,
    }),
    showCalculator: PropTypes.bool,
  }).isRequired,
};
