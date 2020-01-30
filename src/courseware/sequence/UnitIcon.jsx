import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilm, faBook, faPencilAlt, faTasks, faLock,
} from '@fortawesome/free-solid-svg-icons';

export default function UnitIcon({ type }) {
  let icon = null;
  switch (type) {
    case 'video':
      icon = faFilm;
      break;
    case 'other':
      icon = faBook;
      break;
    case 'vertical':
      icon = faTasks;
      break;
    case 'problem':
      icon = faPencilAlt;
      break;
    case 'lock':
      icon = faLock;
      break;
    default:
      icon = faBook;
  }

  return (
    <FontAwesomeIcon icon={icon} />
  );
}

UnitIcon.propTypes = {
  type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem', 'lock']).isRequired,
};
