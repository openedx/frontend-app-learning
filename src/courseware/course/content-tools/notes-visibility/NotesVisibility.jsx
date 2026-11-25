import { useState } from 'react';
import PropTypes from 'prop-types';

import { getAuthenticatedHttpClient, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { unitIFrameId } from '@src/courseware/course/sequence/Unit/constants';
import messages from './messages';

function toggleNotes() {
  const iframe = document.getElementById(unitIFrameId);
  iframe?.contentWindow?.postMessage('tools.toggleNotes', getSiteConfig().lmsBaseUrl);
}

const NotesVisibility = ({ course }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(course.notes.visible);
  const visibilityUrl = `${getSiteConfig().lmsBaseUrl}/courses/${course.id}/edxnotes/visibility/`;

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
