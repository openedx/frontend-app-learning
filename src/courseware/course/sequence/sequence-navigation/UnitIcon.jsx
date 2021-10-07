import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo, faBook, faEdit, faTasks, faLock,
} from '@fortawesome/free-solid-svg-icons';

export default function UnitIcon({ type }) {
  let icon = null;
  switch (type) {
    case 'video':
      icon = faVideo;
      break;
    case 'other':
      icon = faBook;
      break;
    case 'vertical':
      icon = faTasks;
      break;
    case 'problem':
      icon = faEdit;
      break;
    case 'lock':
      icon = faLock;
      break;
    default:
      icon = faBook;
  }

  return (
    <FontAwesomeIcon className="unit-icon" icon={icon} />
  );
}

UnitIcon.propTypes = {
  type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem', 'lock']).isRequired,
};
