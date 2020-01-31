import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function SpinnerIcon(props) {
  return <FontAwesomeIcon pulse icon={faSpinner} {...props} />;
}
