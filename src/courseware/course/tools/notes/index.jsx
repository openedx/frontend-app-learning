import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
// import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import toggleNotes from '../data/thunks';


export default class NotesVisibility extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: !props.course.notes.visible,
    };
    this.visibilityUrl = `${getConfig().LMS_BASE_URL}/courses/${props.course.id}/edxnotes/visibility/`;
  }

  handleClick = () => {
    const data = { visibility: this.state.visible };
    getAuthenticatedHttpClient().put(
      this.visibilityUrl,
      data,
    ).then(() => {
      this.setState((state) => ({ visible: !state.visible }));
      toggleNotes();
    });
  }

  render() {
    const message = this.state.visible ? 'Hide notes' : 'Show notes';
    return (
      <>
        <span className="action-toggle-message" aria-live="polite" />
        <button
          className={`btn ${this.state.visible ? 'btn-success' : 'btn-outline-primary'}`}
          onClick={this.handleClick}
          type="button"
        >
          <FontAwesomeIcon icon={faPencilAlt} aria-hidden="true" />
          <span className="sr-only">
            {message}
          </span>
        </button>
      </>
    );
  }
}

NotesVisibility.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string,
    notes: {
      enabled: PropTypes.boolean,
      visible: PropTypes.boolean,
    },
  }).isRequired,
};
