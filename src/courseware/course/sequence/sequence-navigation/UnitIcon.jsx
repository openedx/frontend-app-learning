import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo, faTasks, faLock,
} from '@fortawesome/free-solid-svg-icons';

import { FileIcon, EditIcon } from '../../../../Icons';

const UnitIcon = ({ type }) => {
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'video':
        return <FontAwesomeIcon className="unit-icon" icon={faVideo} size="lg" />;
      case 'other':
        return <FileIcon className="unit-icon" />;
      case 'vertical':
        return <FontAwesomeIcon className="unit-icon" icon={faTasks} size="lg" />;
      case 'problem':
        return <EditIcon className="unit-icon" />;
      case 'lock':
        return <FontAwesomeIcon className="unit-icon" icon={faLock} size="lg" />;
      default:
        return <FileIcon className="unit-icon" />;
    }
  };

  return (
    <>{renderIcon(type)}</>
  );
};

UnitIcon.propTypes = {
  type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem', 'lock']).isRequired,
};

export default UnitIcon;
