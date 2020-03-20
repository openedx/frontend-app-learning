import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function CompleteIcon(props) {
  return <FontAwesomeIcon icon={faCheck} {...props} />;
}
