import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import messages from './messages';

function toggleNotes() {
  const iframe = document.getElementById('unit-iframe');
  iframe.contentWindow.postMessage('tools.toggleNotes', getConfig().LMS_BASE_URL);
}

const NotesVisibility = ({ course }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(course.notes.visible);
  const visibilityUrl = `${getConfig().LMS_BASE_URL}/courses/${course.id}/edxnotes/visibility/`;

  const handleClick = () => {
    const data = { visibility: !visible };
    getAuthenticatedHttpClient().put(
      visibilityUrl,
      data,
    ).then(() => {
      setVisible(!visible);
      toggleNotes();
    });
  };

  const message = visible ? 'notes.button.hide' : 'notes.button.show';

  return (
    <button
      className={`trigger btn ${visible ? 'text-secondary' : 'text-success'}  mx-2 `}
      role="switch"
      type="button"
      onClick={handleClick}
      onKeyDown={handleClick}
      tabIndex="-1"
      aria-checked={visible ? 'true' : 'false'}
    >
      <FontAwesomeIcon icon={faPencilAlt} aria-hidden="true" className="mr-2" />
      {intl.formatMessage(messages[message])}
    </button>
  );
};

NotesVisibility.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.isRequired,
    notes: PropTypes.shape({
      visible: PropTypes.bool,
    }).isRequired,
  }).isRequired,
};

export default NotesVisibility;
